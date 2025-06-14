
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, XCircle, Search, Wand2, MoreHorizontal } from 'lucide-react';
import { ProductContentHealth } from '@/types/contentHealth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import BulkContentActions from './BulkContentActions';

interface ContentHealthTableProps {
  healthResults: ProductContentHealth[];
  onRefresh: () => void;
  onCreditsUpdated?: () => void;
}

const ContentHealthTable: React.FC<ContentHealthTableProps> = ({ 
  healthResults, 
  onRefresh,
  onCreditsUpdated 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  // Filter products based on search and filters
  const filteredResults = healthResults.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.overall_status === statusFilter;
    const matchesField = fieldFilter === 'all' || product.missing_fields.includes(fieldFilter);
    
    return matchesSearch && matchesStatus && matchesField;
  });

  // Get all unique missing fields for filter dropdown
  const allMissingFields = Array.from(
    new Set(healthResults.flatMap(product => product.missing_fields))
  ).sort();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredResults.map(p => p.product_id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSingleProductFix = async (productId: number, action: string) => {
    try {
      // Simulate single product fix
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${action} started for product`);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'needs_attention':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return null;
    }
  };

  const getMissingFieldBadges = (missingFields: string[]) => {
    const fieldMap: { [key: string]: string } = {
      'Long Description': 'No desc',
      'Short Description': 'No short',
      'Meta Title': 'No title',
      'Meta Description': 'No meta',
      'Image Alt Text': 'No alt',
      'Categories': 'No cat',
    };

    return missingFields.slice(0, 3).map(field => (
      <Badge key={field} variant="outline" className="text-xs">
        {fieldMap[field] || field}
      </Badge>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <BulkContentActions
          selectedProducts={selectedProducts}
          healthResults={healthResults}
          onRefresh={onRefresh}
          onCreditsUpdated={onCreditsUpdated}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Content Health Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="needs_attention">Needs Attention</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by missing field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {allMissingFields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProducts.size === filteredResults.length && filteredResults.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Missing Fields</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No products found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.has(product.product_id)}
                          onCheckedChange={(checked) => 
                            handleSelectProduct(product.product_id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(product.overall_status)}
                          <span className="font-medium">{product.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.overall_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{product.seo_score}%</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${
                                (product.seo_score || 0) >= 80 ? 'bg-green-500' :
                                (product.seo_score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${product.seo_score || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getMissingFieldBadges(product.missing_fields)}
                          {product.missing_fields.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.missing_fields.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSingleProductFix(product.product_id, 'Generate Missing')}>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate Missing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSingleProductFix(product.product_id, 'Regenerate All')}>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Regenerate All
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredResults.length} of {healthResults.length} products
            </span>
            {selectedProducts.size > 0 && (
              <span>
                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentHealthTable;
