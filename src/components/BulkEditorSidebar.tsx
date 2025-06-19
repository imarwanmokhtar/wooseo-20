
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterOptions } from '@/pages/BulkEditor';
import { Category } from '@/types';
import { Filter, X } from 'lucide-react';

interface BulkEditorSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Category[];
  productCount: number;
  horizontal?: boolean;
}

const BulkEditorSidebar: React.FC<BulkEditorSidebarProps> = ({
  filters,
  onFiltersChange,
  categories,
  productCount,
  horizontal = false
}) => {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      tags: [],
      stockStatus: [],
      productType: [],
      priceRange: { min: 0, max: 10000 }
    });
  };

  const hasActiveFilters = () => {
    return filters.categories.length > 0 ||
           filters.tags.length > 0 ||
           filters.stockStatus.length > 0 ||
           filters.productType.length > 0 ||
           filters.priceRange.min > 0 ||
           filters.priceRange.max < 10000;
  };

  const handleCategoryToggle = (categoryId: number, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    updateFilter('categories', newCategories);
  };

  const handleStockStatusToggle = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.stockStatus, status]
      : filters.stockStatus.filter(s => s !== status);
    updateFilter('stockStatus', newStatuses);
  };

  const handleProductTypeToggle = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.productType, type]
      : filters.productType.filter(t => t !== type);
    updateFilter('productType', newTypes);
  };

  if (horizontal) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="font-medium">Smart Filters</span>
            <span className="text-sm text-gray-600">({productCount} products)</span>
          </div>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Categories */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Categories</Label>
            <div className="space-y-1 max-h-32 overflow-auto">
              {categories.slice(0, 5).map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-xs flex-1">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Stock Status</Label>
            <div className="space-y-1">
              {[
                { value: 'instock', label: 'In Stock' },
                { value: 'outofstock', label: 'Out of Stock' },
                { value: 'onbackorder', label: 'On Backorder' }
              ].map(status => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`stock-${status.value}`}
                    checked={filters.stockStatus.includes(status.value)}
                    onCheckedChange={(checked) => handleStockStatusToggle(status.value, checked as boolean)}
                  />
                  <Label htmlFor={`stock-${status.value}`} className="text-xs">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Product Type */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Product Type</Label>
            <div className="space-y-1">
              {[
                { value: 'simple', label: 'Simple' },
                { value: 'variable', label: 'Variable' },
                { value: 'grouped', label: 'Grouped' },
                { value: 'external', label: 'External' }
              ].map(type => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={filters.productType.includes(type.value)}
                    onCheckedChange={(checked) => handleProductTypeToggle(type.value, checked as boolean)}
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-xs">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Price Range</Label>
            <div className="space-y-2">
              <div className="px-2">
                <Slider
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onValueChange={([min, max]) => updateFilter('priceRange', { min, max })}
                  max={10000}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => updateFilter('priceRange', { 
                    ...filters.priceRange, 
                    min: parseInt(e.target.value) || 0 
                  })}
                  className="h-7 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => updateFilter('priceRange', { 
                    ...filters.priceRange, 
                    max: parseInt(e.target.value) || 10000 
                  })}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Original vertical layout
  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Smart Filters
          </CardTitle>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">{productCount} products</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-6">
        {/* Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Categories</Label>
          <div className="space-y-2 max-h-40 overflow-auto">
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                />
                <Label htmlFor={`category-${category.id}`} className="text-xs flex-1">
                  {category.name} ({category.count})
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Stock Status</Label>
          <div className="space-y-2">
            {[
              { value: 'instock', label: 'In Stock' },
              { value: 'outofstock', label: 'Out of Stock' },
              { value: 'onbackorder', label: 'On Backorder' }
            ].map(status => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`stock-${status.value}`}
                  checked={filters.stockStatus.includes(status.value)}
                  onCheckedChange={(checked) => handleStockStatusToggle(status.value, checked as boolean)}
                />
                <Label htmlFor={`stock-${status.value}`} className="text-xs">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Product Type */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Product Type</Label>
          <div className="space-y-2">
            {[
              { value: 'simple', label: 'Simple' },
              { value: 'variable', label: 'Variable' },
              { value: 'grouped', label: 'Grouped' },
              { value: 'external', label: 'External' }
            ].map(type => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.productType.includes(type.value)}
                  onCheckedChange={(checked) => handleProductTypeToggle(type.value, checked as boolean)}
                />
                <Label htmlFor={`type-${type.value}`} className="text-xs">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={[filters.priceRange.min, filters.priceRange.max]}
                onValueChange={([min, max]) => updateFilter('priceRange', { min, max })}
                max={10000}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => updateFilter('priceRange', { 
                  ...filters.priceRange, 
                  min: parseInt(e.target.value) || 0 
                })}
                className="h-8 text-xs"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => updateFilter('priceRange', { 
                  ...filters.priceRange, 
                  max: parseInt(e.target.value) || 10000 
                })}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkEditorSidebar;
