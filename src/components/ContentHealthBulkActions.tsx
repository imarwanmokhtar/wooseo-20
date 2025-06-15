
import React from 'react';
import { Button } from '@/components/ui/button';
import { ProductContentHealth } from '@/types/contentHealth';

interface ContentHealthBulkActionsProps {
  incompleteResults: ProductContentHealth[];
  onOpenBulkDialog: () => void;
}

const ContentHealthBulkActions: React.FC<ContentHealthBulkActionsProps> = ({
  incompleteResults,
  onOpenBulkDialog
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="flex-1">
        {/* Space for future controls */}
      </div>
      <div>
        <Button
          onClick={onOpenBulkDialog}
          disabled={incompleteResults.length === 0}
          variant="default"
          size="sm"
          className="mb-2 md:mb-0"
        >
          Regenerate All Incomplete Products
        </Button>
      </div>
    </div>
  );
};

export default ContentHealthBulkActions;
