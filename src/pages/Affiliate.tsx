
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AffiliateRegistration from '@/components/AffiliateRegistration';
import AffiliateDashboard from '@/components/AffiliateDashboard';
import { useAffiliateStatus } from '@/hooks/useAffiliateStatus';
import { Loader2 } from 'lucide-react';

const Affiliate: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { affiliate, loading: affiliateLoading, refetch } = useAffiliateStatus();

  if (authLoading || affiliateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!affiliate ? (
          <AffiliateRegistration onSuccess={refetch} />
        ) : (
          <AffiliateDashboard affiliate={affiliate} />
        )}
      </div>
    </div>
  );
};

export default Affiliate;
