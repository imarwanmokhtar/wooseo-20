
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import WithdrawalRequest from './WithdrawalRequest';
import WithdrawalHistory from './WithdrawalHistory';

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

interface AffiliateDashboardProps {
  affiliate: Affiliate;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ affiliate }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/register?ref=${affiliate.affiliate_code}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      active: 'default',
      suspended: 'destructive',
      inactive: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your affiliate account and track your earnings
          </p>
        </div>
        {getStatusBadge(affiliate.status)}
      </div>

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
              Commission rate: {(affiliate.commission_rate * 100).toFixed(0)}%
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
              Users referred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Referral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${affiliate.total_referrals > 0 
                ? (affiliate.total_earnings / affiliate.total_referrals).toFixed(2) 
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average earnings per referral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
              {referralLink}
            </div>
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Share this link to earn {(affiliate.commission_rate * 100).toFixed(0)}% commission on purchases made by your referrals.
          </p>
        </CardContent>
      </Card>

      {/* Withdrawal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithdrawalRequest 
          affiliate={affiliate} 
          onSuccess={() => window.location.reload()} 
        />
        <WithdrawalHistory affiliateId={affiliate.id} />
      </div>

      {affiliate.status !== 'active' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-600">
              <div className="text-sm">
                <strong>Account Status: {affiliate.status}</strong>
                {affiliate.status === 'pending' && (
                  <p className="mt-1">
                    Your affiliate account is pending approval. You'll be able to earn commissions once approved.
                  </p>
                )}
                {affiliate.status === 'suspended' && (
                  <p className="mt-1">
                    Your affiliate account has been suspended. Please contact support for more information.
                  </p>
                )}
                {affiliate.status === 'inactive' && (
                  <p className="mt-1">
                    Your affiliate account is inactive. Please contact support to reactivate your account.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AffiliateDashboard;
