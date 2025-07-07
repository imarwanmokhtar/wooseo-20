
import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect }) => {
  // Get the first image or use a placeholder
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : '/placeholder.svg';

  // Function to truncate product title
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Cleanup HTML in description if needed
  const cleanDescription = (htmlString: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <Card className={`p-4 h-24 flex items-center gap-4 transition-all ${isSelected ? 'border-seo-primary bg-blue-50' : ''}`}>
      <div className="flex-shrink-0">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onSelect()}
        />
      </div>
      
      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="flex-grow min-w-0 h-full flex flex-col justify-center">
        <h3 
          className="font-medium text-sm leading-tight cursor-help line-clamp-2" 
          title={product.name}
        >
          {truncateTitle(product.name)}
        </h3>
        
        <div className="flex items-center gap-3 mt-1">
          <span className="font-semibold text-sm">
            {formatPrice(parseFloat(product.price))}
          </span>
          
          <span className="text-xs text-gray-500">
            SKU: {product.sku || 'N/A'}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-wrap gap-1 max-w-48">
        {product.categories.slice(0, 2).map((cat) => (
          <Badge key={cat.id} variant="secondary" className="text-xs">
            {cat.name}
          </Badge>
        ))}
        {product.categories.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{product.categories.length - 2}
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
