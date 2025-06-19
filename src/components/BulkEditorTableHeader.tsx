
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkEditorTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

const BulkEditorTableHeader: React.FC<BulkEditorTableHeaderProps> = ({
  selectedCount,
  totalCount,
  onSelectAll
}) => {
  return (
    <div className="sticky top-0 bg-white border-b z-10">
      <div className="grid grid-cols-[40px_40px_80px_250px_120px_100px_100px_80px_120px_100px_150px_100px_100px] gap-1 text-xs font-medium border-b">
        <div className="p-2 border-r bg-gray-50">
          <Checkbox
            checked={selectedCount === totalCount && totalCount > 0}
            onCheckedChange={onSelectAll}
          />
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
