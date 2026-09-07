
import { useEffect, useState } from 'react';

export const useReferralCode = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Get referral code from localStorage
    const storedCode = localStorage.getItem('referral_code');
    if (storedCode) {
      setReferralCode(storedCode);
    }
  }, []);

  const clearReferralCode = () => {
    localStorage.removeItem('referral_code');
    setReferralCode(null);
  };

  return {
    referralCode,
    clearReferralCode
  };
};
