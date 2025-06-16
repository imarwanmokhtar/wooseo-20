
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, AlertCircle, Info } from 'lucide-react';

interface WithdrawalRequestProps {
  affiliate: {
    id: string;
    total_earnings: number;
  };
  onSuccess?: () => void;
}

const WithdrawalRequest: React.FC<WithdrawalRequestProps> = ({ affiliate, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const withdrawalAmount = parseFloat(amount);
    
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount < 50) {
      setError('Minimum withdrawal amount is $50');
      return;
    }

    if (withdrawalAmount > affiliate.total_earnings) {
      setError('Withdrawal amount cannot exceed your available earnings');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert([
          {
            affiliate_id: affiliate.id,
            amount: withdrawalAmount
          }
        ]);

      if (error) {
        console.error('Error creating withdrawal request:', error);
        if (error.message.includes('check_withdrawal_eligibility')) {
          setError('Withdrawal amount exceeds available balance or is below minimum amount');
        } else {
          setError('Failed to create withdrawal request');
        }
        return;
      }

      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted successfully. We'll process it manually and contact you via email.",
      });

      setAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Error in withdrawal request:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Request Withdrawal
        </CardTitle>
        <CardDescription>
          Request a withdrawal of your affiliate earnings. Minimum withdrawal amount is $50.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Withdrawal requests are processed manually. We'll contact you via email once your request is reviewed and processed.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="50"
              max={affiliate.total_earnings}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Available earnings: ${affiliate.total_earnings.toFixed(2)}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={loading || affiliate.total_earnings < 50}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </Button>

          {affiliate.total_earnings < 50 && (
            <p className="text-sm text-muted-foreground text-center">
              You need at least $50 in earnings to request a withdrawal.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default WithdrawalRequest;
