
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { ProductContentHealth } from '@/types/contentHealth';

interface ContentHealthTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'complete' | 'needs_attention' | 'critical';
  onStatusFilterChange: (filter: 'all' | 'complete' | 'needs_attention' | 'critical') => void;
  healthResults: ProductContentHealth[];
  filteredCount: number;
  onRefresh: () => void;
}

const ContentHealthTableFilters: React.FC<ContentHealthTableFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  healthResults,
  filteredCount,
  onRefresh
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Product Content Health</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredCount} of {healthResults.length} products
            </p>
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', count: healthResults.length },
              { value: 'complete', label: 'Complete', count: healthResults.filter(r => r.overall_status === 'complete').length },
              { value: 'needs_attention', label: 'Needs Attention', count: healthResults.filter(r => r.overall_status === 'needs_attention').length },
              { value: 'critical', label: 'Critical', count: healthResults.filter(r => r.overall_status === 'critical').length }
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusFilterChange(filter.value as any)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentHealthTableFilters;
