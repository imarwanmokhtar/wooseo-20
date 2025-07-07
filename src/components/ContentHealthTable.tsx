import React, { useState, useMemo } from 'react';
import { ProductContentHealth } from '@/types/contentHealth';
import { Product } from '@/types';
import Pagination from './Pagination';
import ProductDetailsPage from './ProductDetailsPage';
import { fetchProducts, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import BulkHealthRegenerateDialog from './BulkHealthRegenerateDialog';
import { AIModel } from './ModelSelector';
import { toast } from 'sonner';
import { useSeoPlugin } from '@/contexts/SeoPluginContext';
import ContentHealthTableFilters from './ContentHealthTableFilters';
import ContentHealthBulkActions from './ContentHealthBulkActions';
import ContentHealthTableDisplay from './ContentHealthTableDisplay';
import ContentHealthEmptyState from './ContentHealthEmptyState';
import { generateSeoContent, getDefaultPromptTemplate } from '@/services/aiGenerationService';
import { updateProductWithSeoContent } from '@/services/wooCommerceApi';

interface ContentHealthTableProps {
  healthResults: ProductContentHealth[];
  onRefresh: () => void;
  onCreditsUpdated: () => void;
}

const ITEMS_PER_PAGE = 20;

const modelCreditCost: Record<AIModel, number> = {
  "gpt-4o-mini": 1,
  "gpt-4o": 2,
  "gpt-4.1": 3,
  "gpt-3.5-turbo": 1,
  "gemini-2.0-flash": 1,
};

const ContentHealthTable: React.FC<ContentHealthTableProps> = ({ 
  healthResults, 
  onRefresh,
  onCreditsUpdated 
}) => {
  const { user, credits, refreshCredits } = useAuth();
  const { activeStore } = useMultiStore();
  const { selectedPlugin } = useSeoPlugin();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'needs_attention' | 'critical'>('all');
  const [selectedProduct, setSelectedProduct] = useState<{ product: Product; healthData: ProductContentHealth } | null>(null);
  const [loadingProduct, setLoadingProduct] = useState<number | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filter and search logic
  const filteredResults = useMemo(() => {
    let filtered = healthResults;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(result => result.overall_status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [healthResults, statusFilter, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Compute incomplete results only (not "complete")
  const incompleteResults = useMemo(() => 
    filteredResults.filter(result => result.overall_status === 'needs_attention' || result.overall_status === 'critical'), 
    [filteredResults]
  );

  // Handler for bulk button (open modal/dialog)
  const openBulkDialog = () => setBulkDialogOpen(true);
  const closeBulkDialog = () => setBulkDialogOpen(false);

  // --- Updated bulk regeneration logic to use real AI generation ---
  async function handleBulkRegenerate(selectedModel: AIModel) {
    if (!user || !activeStore) {
      toast.error("User and active store required");
      return;
    }

    if (!selectedPlugin) {
      toast.error("Please select your SEO plugin first");
      return;
    }

    const productList = incompleteResults;
    const totalToProcess = productList.length;
    const perProductCost = modelCreditCost[selectedModel];
    const totalCost = totalToProcess * perProductCost;

    if (credits < totalCost) {
      toast.error("You do not have enough credits to regenerate all fields for these products.");
      return;
    }

    setBulkLoading(true);
    let processed = 0;
    let failed = 0;

    console.log(`Starting AI-powered bulk regeneration for ${totalToProcess} products using ${selectedPlugin} SEO plugin and ${selectedModel} model`);

    try {
      // Get the default prompt template for AI generation
      const defaultPrompt = await getDefaultPromptTemplate(user.id);
      
      // Loop over each product and use real AI generation
      for (const result of productList) {
        try {
          // Fetch product details
          const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
          if (!credentials) throw new Error("No WooCommerce credentials");

          const { products } = await fetchProducts(credentials, {
            include: [result.product_id],
            per_page: 1
          });
          if (products.length === 0) throw new Error("Product not found");

          const product = products[0];

          console.log(`Generating AI content for product: ${product.name} using ${selectedModel}`);
          
          // Use real AI generation service (same as Products tab)
          const aiGeneratedContent = await generateSeoContent(
            product, 
            defaultPrompt, 
            user.id, 
            selectedModel, 
            activeStore.id
          );

          // Save the AI-generated content back to WooCommerce
          const updateResult = await updateProductWithSeoContent(
            credentials, 
            product.id, 
            aiGeneratedContent, 
            selectedPlugin
          );

          if (updateResult.success) {
            processed++;
            console.log(`Successfully regenerated AI content for product ${product.name} with ${selectedPlugin} SEO plugin`);
          } else {
            failed++;
            console.error(`Failed to update product ${product.name} in WooCommerce`);
          }

          // Add delay between requests to prevent API rate limits
          if (processed + failed < totalToProcess) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (err) {
          failed++;
          console.error('Bulk AI regeneration error:', err);
        }
      }

      // Refresh credits from server after all operations complete
      await refreshCredits();

      setBulkLoading(false);
      setBulkDialogOpen(false);
      
      const successMessage = `AI regenerated ${processed} products successfully using ${selectedPlugin === 'rankmath' ? 'RankMath' : selectedPlugin === 'yoast' ? 'Yoast SEO' : selectedPlugin === 'aioseo' ? 'All in One SEO' : 'Universal'} fields with ${selectedModel} model${failed ? ` (${failed} failed)` : ""}.`;
      toast.success(successMessage);
      console.log(successMessage);
      
      onRefresh();
      onCreditsUpdated();

    } catch (error) {
      console.error('Bulk AI regeneration failed:', error);
      setBulkLoading(false);
      setBulkDialogOpen(false);
      toast.error('Bulk AI regeneration failed. Please try again.');
    }
  }

  const handleViewDetails = async (healthData: ProductContentHealth) => {
    if (!activeStore || !user) {
      console.error('No active store or user');
      return;
    }

    setLoadingProduct(healthData.product_id);
    try {
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        console.error('No credentials found');
        return;
      }

      // Fetch the full product details
      const { products } = await fetchProducts(credentials, {
        include: [healthData.product_id],
        per_page: 1
      });

      if (products.length > 0) {
        setSelectedProduct({
          product: products[0],
          healthData: healthData
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoadingProduct(null);
    }
  };

  const handleBackToTable = () => {
    setSelectedProduct(null);
  };

  const handleContentUpdated = () => {
    onRefresh();
    onCreditsUpdated();
  };

  // If a product is selected, show the details page
  if (selectedProduct) {
    return (
      <ProductDetailsPage
        product={selectedProduct.product}
        healthData={selectedProduct.healthData}
        onBack={handleBackToTable}
        onContentUpdated={handleContentUpdated}
      />
    );
  }

  if (healthResults.length === 0) {
    return <ContentHealthEmptyState onRefresh={onRefresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Bulk Regenerate Dialog */}
      <BulkHealthRegenerateDialog
        open={bulkDialogOpen}
        onClose={closeBulkDialog}
        onConfirm={handleBulkRegenerate}
        incompleteCount={incompleteResults.length}
        userCredits={credits}
        loading={bulkLoading}
      />

      {/* Bulk Actions */}
      <ContentHealthBulkActions
        incompleteResults={incompleteResults}
        onOpenBulkDialog={openBulkDialog}
      />

      {/* Filters and Search */}
      <ContentHealthTableFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        healthResults={healthResults}
        filteredCount={filteredResults.length}
        onRefresh={onRefresh}
      />

      {/* Results Table */}
      <ContentHealthTableDisplay
        paginatedResults={paginatedResults}
        filteredResults={filteredResults}
        onViewDetails={handleViewDetails}
        loadingProduct={loadingProduct}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ContentHealthTable;
