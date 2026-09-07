
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkEditorTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
  isSelectingAll?: boolean;
}

const BulkEditorTableHeader: React.FC<BulkEditorTableHeaderProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  isSelectingAll = false
}) => {
  return (
    <div className="sticky top-0 bg-white border-b z-10">
      <div className="grid grid-cols-[40px_40px_80px_250px_120px_100px_100px_80px_120px_100px_150px_100px_100px] gap-1 text-xs font-medium border-b">
        <div className="p-2 border-r bg-gray-50 flex items-center justify-center">
          <div className="relative">
            <Checkbox
              checked={selectedCount === totalCount && totalCount > 0}
              onCheckedChange={onSelectAll}
              disabled={isSelectingAll}
            />
            {isSelectingAll && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
        <div className="p-2 border-r bg-gray-50"></div>
        <div className="p-2 border-r bg-gray-50">ID</div>
        <div className="p-2 border-r bg-gray-50">Title</div>
        <div className="p-2 border-r bg-gray-50">SKU</div>
        <div className="p-2 border-r bg-gray-50">Price</div>
        <div className="p-2 border-r bg-gray-50">Sale Price</div>
        <div className="p-2 border-r bg-gray-50">Stock</div>
        <div className="p-2 border-r bg-gray-50">Stock Status</div>
        <div className="p-2 border-r bg-gray-50">Visibility</div>
        <div className="p-2 border-r bg-gray-50">Category</div>
        <div className="p-2 border-r bg-gray-50">Type</div>
        <div className="p-2 bg-gray-50">Status</div>
      </div>
    </div>
  );
};

export default BulkEditorTableHeader;
