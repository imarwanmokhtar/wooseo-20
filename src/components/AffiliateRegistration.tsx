
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, DollarSign, Users, TrendingUp, Loader2 } from 'lucide-react';

interface AffiliateRegistrationProps {
  onSuccess: () => void;
}

const AffiliateRegistration: React.FC<AffiliateRegistrationProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleRegister = async () => {
    if (!user) {
      toast.error('You must be logged in to register as an affiliate');
      return;
    }

    setLoading(true);
    try {
      console.log('Registering affiliate for user:', user.id);
      
      // Call the generate_affiliate_code function to get a unique code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_affiliate_code');

      if (codeError) {
        console.error('Error generating affiliate code:', codeError);
        throw codeError;
      }

      console.log('Generated affiliate code:', codeData);

      // Create the affiliate record
      const { data, error } = await supabase
        .from('affiliates')
        .insert([
          {
            user_id: user.id,
            affiliate_code: codeData,
            status: 'pending' // Will be reviewed and approved
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating affiliate:', error);
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You are already registered as an affiliate');
        }
        throw error;
      }

      console.log('Affiliate created:', data);
      toast.success('Affiliate application submitted successfully! Your account is pending approval.');
      onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register as affiliate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Join Our Affiliate Program
        </h1>
        <p className="text-xl text-gray-600">
          Earn 40% commissions by referring customers to our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <CardTitle>Earn 40% Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">
              Earn 40% commission on every purchase made by your referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <CardTitle>Track Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">
              Monitor your referrals and their activity in real-time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-2" />
            <CardTitle>Monthly Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">
              Receive your earnings monthly via your preferred payment method
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Become an Affiliate
          </CardTitle>
          <CardDescription>
            Apply to join our affiliate program and start earning commissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Submit your affiliate application</li>
              <li>Get approved and receive your unique referral code</li>
              <li>Share your referral link with potential customers</li>
              <li>Earn 40% commission on every purchase made through your link</li>
              <li>Track your earnings and get paid monthly</li>
            </ol>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Requirements:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Active account on our platform</li>
              <li>Ability to promote our services ethically</li>
              <li>Compliance with our terms of service</li>
            </ul>
          </div>

          <Button 
            onClick={handleRegister} 
            disabled={loading || !user}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              'Apply to Become an Affiliate'
            )}
          </Button>

          {!user && (
            <p className="text-center text-sm text-gray-500">
              You must be logged in to register as an affiliate
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateRegistration;
