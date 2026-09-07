
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface BulkEditorGridToolbarProps {
  onSaveChanges: () => void;
  unsavedChangesCount: number;
}

const BulkEditorGridToolbar: React.FC<BulkEditorGridToolbarProps> = ({
  onSaveChanges,
  unsavedChangesCount
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {unsavedChangesCount > 0 ? `${unsavedChangesCount} unsaved changes` : 'All changes saved'}
        </span>
      </div>

      <Button
        onClick={onSaveChanges}
        disabled={unsavedChangesCount === 0}
        className="bg-green-600 hover:bg-green-700"
      >
        <Save className="h-4 w-4 mr-2" />
        Sync to WooCommerce ({unsavedChangesCount})
      </Button>
    </div>
  );
};

export default BulkEditorGridToolbar;
