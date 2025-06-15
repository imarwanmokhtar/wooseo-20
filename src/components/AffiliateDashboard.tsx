
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Copy, DollarSign, Users, TrendingUp, Loader2 } from 'lucide-react';

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  commission_rate: number;
  total_earnings: number;
  total_referrals: number;
  created_at: string;
  updated_at: string;
}

interface Referral {
  id: string;
  referred_user_id: string;
  referral_code: string;
  created_at: string;
}

interface Commission {
  id: string;
  purchase_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: 'pending' | 'paid' | 'cancelled';
  description: string;
  created_at: string;
  paid_at: string | null;
}

interface AffiliateDashboardProps {
  affiliate: Affiliate;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ affiliate }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  const referralLink = `${window.location.origin}?ref=${affiliate.affiliate_code}`;

  const fetchReferrals = async () => {
    try {
      console.log('Fetching referrals for affiliate:', affiliate.id);
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        throw error;
      }
      
      console.log('Referrals data:', data);
      setReferrals(data || []);
    } catch (error: any) {
      console.error('Error fetching referrals:', error);
      toast.error('Failed to load referrals');
    }
  };

  const fetchCommissions = async () => {
    try {
      console.log('Fetching commissions for affiliate:', affiliate.id);
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        throw error;
      }
      
      console.log('Commissions data:', data);
      setCommissions(data || []);
    } catch (error: any) {
      console.error('Error fetching commissions:', error);
      toast.error('Failed to load commissions');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReferrals(), fetchCommissions()]);
      setLoading(false);
    };

    if (affiliate?.id) {
      loadData();
    }
  }, [affiliate.id]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your affiliate account and track your earnings
          </p>
        </div>
        {getStatusBadge(affiliate.status)}
      </div>

      {affiliate.status === 'pending' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <p className="text-yellow-800 font-medium">
                Your affiliate application is pending approval. You'll be notified once it's reviewed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliate.total_earnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {(affiliate.commission_rate * 100).toFixed(0)}% commission rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliate.total_referrals}</div>
            <p className="text-xs text-muted-foreground">
              Users referred by you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${commissions
                .filter(c => c.status === 'pending')
                .reduce((sum, c) => sum + c.commission_amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      {affiliate.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link to start earning commissions from referrals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button onClick={copyReferralLink} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Your affiliate code:</strong> {affiliate.affiliate_code}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commissions</CardTitle>
          <CardDescription>
            Your latest commission earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Purchase Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.slice(0, 10).map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      {new Date(commission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{commission.description}</TableCell>
                    <TableCell>${commission.purchase_amount.toFixed(2)}</TableCell>
                    <TableCell>${commission.commission_amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No commissions yet. Start sharing your referral link!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>
            Users who signed up through your referral link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Referral Code Used</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.slice(0, 10).map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      {new Date(referral.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono">{referral.referral_code}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {referral.referred_user_id.slice(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No referrals yet. Share your link to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateDashboard;
