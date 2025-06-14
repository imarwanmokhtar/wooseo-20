
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { ProductContentHealth } from '@/types/contentHealth';
import { AIModel } from './ModelSelector';
import ModelSelector from './ModelSelector';
import { supabase } from '@/integrations/supabase/client';

interface BulkContentActionsProps {
  selectedProducts: Set<number>;
  healthResults: ProductContentHealth[];
  onRefresh: () => void;
  onCreditsUpdated?: () => void;
}

const BulkContentActions: React.FC<BulkContentActionsProps> = ({
  selectedProducts,
  healthResults,
  onRefresh,
  onCreditsUpdated
}) => {
  const { user } = useAuth();
  const { activeStore } = useMultiStore();
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const [userCredits, setUserCredits] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user credits
  React.useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setUserCredits(data.credits);
      }
    };

    fetchCredits();
  }, [user]);

  const modelCredits = {
    'gemini-2.0-flash': 1,
    'gpt-4o-mini': 1,
    'gpt-3.5-turbo': 1,
    'gpt-4o': 2,
    'gpt-4.1': 3
  };

  const handleBulkGeneration = async (action: 'missing' | 'all') => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products to generate content for');
      return;
    }

    if (!user || !activeStore) {
      toast.error('Please ensure you are logged in and have selected a store');
      return;
    }

    const creditsRequired = selectedProducts.size * modelCredits[selectedModel];
    
    if (userCredits < creditsRequired) {
      toast.error(`Insufficient credits. You need ${creditsRequired} credits but have ${userCredits}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedProductIds = Array.from(selectedProducts);
      
      // Get the products to generate content for
      const productsToProcess = healthResults.filter(h => 
        selectedProductIds.includes(h.product_id)
      );

      console.log(`Starting ${action} content generation for ${productsToProcess.length} products using ${selectedModel}`);
      
      // Start bulk generation
      const { data, error } = await supabase.functions.invoke('start-bulk-generation', {
        body: {
          productIds: selectedProductIds,
          storeId: activeStore.id,
          userId: user.id,
          model: selectedModel,
          action: action, // 'missing' or 'all'
          creditsRequired
        }
      });

      if (error) {
        console.error('Bulk generation error:', error);
        toast.error(`Failed to start bulk generation: ${error.message}`);
        return;
      }

      // Deduct credits locally for immediate UI update
      setUserCredits(prev => prev - creditsRequired);
      
      toast.success(`Bulk content generation started for ${selectedProducts.size} products using ${selectedModel}. Credits used: ${creditsRequired}`);
      
      // Refresh the health analysis
      setTimeout(() => {
        onRefresh();
      }, 2000);

      // Call the credits updated callback
      if (onCreditsUpdated) {
        onCreditsUpdated();
      }

    } catch (error) {
      console.error('Bulk generation error:', error);
      toast.error('Failed to start bulk content generation');
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedProducts.size === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Select products to generate content</p>
        </CardContent>
      </Card>
    );
  }

  const creditsRequired = selectedProducts.size * modelCredits[selectedModel];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Content Generation</CardTitle>
        <p className="text-sm text-gray-600">
          {selectedProducts.size} products selected • {creditsRequired} credits required
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          userCredits={userCredits}
        />
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleBulkGeneration('missing')}
            disabled={isGenerating || userCredits < creditsRequired}
            className="flex-1"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Missing'}
          </Button>
          
          <Button
            onClick={() => handleBulkGeneration('all')}
            disabled={isGenerating || userCredits < creditsRequired}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Regenerate All'}
          </Button>
        </div>

        {userCredits < creditsRequired && (
          <p className="text-sm text-red-500">
            Insufficient credits. You have {userCredits} but need {creditsRequired}.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkContentActions;
