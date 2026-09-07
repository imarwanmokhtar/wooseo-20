
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const ReferralTracker: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get('ref');
    
    if (referralCode) {
      console.log('Referral code detected:', referralCode);
      
      // Store the referral code in localStorage so it persists during registration
      localStorage.setItem('referral_code', referralCode);
      
      // Remove the ref parameter from URL to clean it up
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
};

export default ReferralTracker;
