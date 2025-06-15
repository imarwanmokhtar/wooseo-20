
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductContentHealth } from '@/types/contentHealth';
import ContentHealthTableRow from './ContentHealthTableRow';

interface ContentHealthTableDisplayProps {
  paginatedResults: ProductContentHealth[];
  filteredResults: ProductContentHealth[];
  onViewDetails: (healthData: ProductContentHealth) => void;
  loadingProduct: number | null;
}

const ContentHealthTableDisplay: React.FC<ContentHealthTableDisplayProps> = ({
  paginatedResults,
  filteredResults,
  onViewDetails,
  loadingProduct
}) => {
  return (
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
              <ContentHealthTableRow
                key={result.product_id}
                result={result}
                onViewDetails={onViewDetails}
                loadingProduct={loadingProduct}
              />
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
  );
};

export default ContentHealthTableDisplay;
