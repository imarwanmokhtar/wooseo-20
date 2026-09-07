
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, Eye } from 'lucide-react';
import { ProductContentHealth } from '@/types/contentHealth';

interface ContentHealthTableRowProps {
  result: ProductContentHealth;
  onViewDetails: (healthData: ProductContentHealth) => void;
  loadingProduct: number | null;
}

const ContentHealthTableRow: React.FC<ContentHealthTableRowProps> = ({
  result,
  onViewDetails,
  loadingProduct
}) => {
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

  // Get fields that are truly missing vs poor quality
  const missingFields = result.checks?.filter(check => check.status === 'missing').map(check => check.field) || result.missing_fields;
  const poorFields = result.checks?.filter(check => check.status === 'poor').map(check => check.field) || [];

  return (
    <TableRow>
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
        {(missingFields.length > 0 || poorFields.length > 0) ? (
          <div className="flex flex-wrap gap-1">
            {/* Show missing fields with red badges */}
            {missingFields.slice(0, 2).map((field) => (
              <Badge key={field} variant="destructive" className="text-xs">
                {field.replace('_', ' ')} (missing)
              </Badge>
            ))}
            {/* Show poor quality fields with yellow badges */}
            {poorFields.slice(0, 2 - missingFields.length).map((field) => (
              <Badge key={field} className="text-xs bg-yellow-100 text-yellow-800">
                {field.replace('_', ' ')} (poor)
              </Badge>
            ))}
            {(missingFields.length + poorFields.length) > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(missingFields.length + poorFields.length) - 2} more
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-green-600 text-sm">All complete</span>
        )}
      </TableCell>
      <TableCell>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(result)}
          disabled={loadingProduct === result.product_id}
        >
          <Eye className="h-4 w-4 mr-2" />
          {loadingProduct === result.product_id ? 'Loading...' : 'View Details'}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ContentHealthTableRow;
