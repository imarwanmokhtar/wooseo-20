
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AffiliateRegistration from '@/components/AffiliateRegistration';
import AffiliateDashboard from '@/components/AffiliateDashboard';
import { useAffiliateStatus } from '@/hooks/useAffiliateStatus';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Affiliate: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { affiliate, loading: affiliateLoading, error, refetch } = useAffiliateStatus();

  if (authLoading || affiliateLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!affiliate ? (
          <AffiliateRegistration onSuccess={refetch} />
        ) : (
          <AffiliateDashboard affiliate={affiliate} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Affiliate;
