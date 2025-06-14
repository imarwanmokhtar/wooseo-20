
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, XCircle, Search, RefreshCw, Eye } from 'lucide-react';
import { ProductContentHealth } from '@/types/contentHealth';
import Pagination from './Pagination';

interface ContentHealthTableProps {
  healthResults: ProductContentHealth[];
  onRefresh: () => void;
  onCreditsUpdated: () => void;
}

const ITEMS_PER_PAGE = 20;

const ContentHealthTable: React.FC<ContentHealthTableProps> = ({ 
  healthResults, 
  onRefresh,
  onCreditsUpdated 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'needs_attention' | 'critical'>('all');

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'needs_attention':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  if (healthResults.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold">No Health Data Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Run a content health scan to analyze your products and identify missing SEO fields.
            </p>
            <Button onClick={onRefresh}>
              Start Content Health Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Product Content Health</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredResults.length} of {healthResults.length} products
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  onClick={() => setStatusFilter(filter.value as any)}
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Missing Fields</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((result) => (
                <TableRow key={result.product_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.overall_status)}
                      <div>
                        <p className="font-medium">{result.product_name}</p>
                        <p className="text-sm text-gray-500">ID: {result.product_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(result.overall_status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            result.seo_score >= 80 ? 'bg-green-500' :
                            result.seo_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${result.seo_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{result.seo_score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.missing_fields.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {result.missing_fields.slice(0, 2).map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field.replace('_', ' ')}
                          </Badge>
                        ))}
                        {result.missing_fields.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.missing_fields.length - 2} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm">All complete</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No products found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

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
