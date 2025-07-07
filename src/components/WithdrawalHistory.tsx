
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, History, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

interface WithdrawalHistoryProps {
  affiliateId: string;
}

const allowedStatus = ['pending', 'approved', 'processed', 'rejected'] as const;

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ affiliateId }) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawals:', error);
        setError('Failed to load withdrawal history');
        return;
      }

      // Safely cast status to allowed literal types
      const requests: WithdrawalRequest[] = (data || [])
        .map((item: any) => {
          const status: WithdrawalRequest['status'] =
            allowedStatus.includes(item.status)
              ? item.status
              : 'pending';
          return {
            id: item.id,
            amount: Number(item.amount),
            status,
            admin_notes: item.admin_notes,
            created_at: item.created_at,
            processed_at: item.processed_at,
          };
        });
      setWithdrawals(requests);
    } catch (error) {
      console.error('Error in fetchWithdrawals:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (affiliateId) {
      fetchWithdrawals();
    }
  }, [affiliateId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      approved: 'secondary',
      processed: 'default',
      rejected: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Withdrawal History
        </CardTitle>
        <CardDescription>
          Track the status of your withdrawal requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No withdrawal requests yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-medium">
                    ${withdrawal.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(withdrawal.status)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(withdrawal.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {withdrawal.processed_at 
                      ? format(new Date(withdrawal.processed_at), 'MMM dd, yyyy')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {withdrawal.admin_notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalHistory;
