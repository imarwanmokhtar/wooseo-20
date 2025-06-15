
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ModelSelector, { AIModel } from './ModelSelector';
import { Loader2 } from 'lucide-react';

interface BulkHealthRegenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedModel: AIModel) => void;
  incompleteCount: number;
  userCredits: number;
  loading: boolean;
}

const modelCreditCost: Record<AIModel, number> = {
  "gpt-4o-mini": 1,
  "gpt-4o": 2,
  "gpt-4.1": 3,
  "gpt-3.5-turbo": 1,
  "gemini-2.0-flash": 1,
};

const BulkHealthRegenerateDialog: React.FC<BulkHealthRegenerateDialogProps> = ({
  open,
  onClose,
  onConfirm,
  incompleteCount,
  userCredits,
  loading
}) => {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const totalCost = incompleteCount * modelCreditCost[selectedModel];
  const canAfford = userCredits >= totalCost;

  return (
    <Dialog open={open} onOpenChange={open => { if (!open && !loading) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate All Incomplete Products</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-4">
          <div>
            <span className="font-medium">{incompleteCount} products selected</span>
            <span className="ml-2 text-sm text-gray-500">(status: Needs Attention or Critical)</span>
          </div>
          <fieldset disabled={loading} className="space-y-4">
            <div>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                userCredits={userCredits}
              />
            </div>
            <div>
              <span>Total cost: </span>
              <span className={`font-semibold ${canAfford ? "text-black" : "text-red-600"}`}>
                {totalCost} credit{totalCost !== 1 ? "s" : ""}
              </span>
            </div>
          </fieldset>
          {!canAfford && (
            <div className="text-red-500 text-sm">
              Not enough credits available. Please purchase more credits to continue.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            disabled={!canAfford || loading}
            onClick={() => onConfirm(selectedModel)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Regenerating..." : "Regenerate All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkHealthRegenerateDialog;
