
import { supabase } from '@/integrations/supabase/client';

export const createSubscription = async (creditPackage: '50' | '500' | '1000') => {
  // Stripe price IDs (if needed elsewhere)
  const stripePriceIds: { [key: string]: string } = {
    '50': 'price_5', // Replace with actual Stripe price ID for 50 credits
    '500': 'price_20', // Replace with actual Stripe price ID for 500 credits
    '1000': 'price_35', // Replace with actual Stripe price ID for 1000 credits
  };
  try {
    console.log('Creating checkout session for credit package:', creditPackage);
    // Correct prices for new tiers
    const prices = {
      '50': 5, // $5 for 50 credits (Starter)
      '500': 20, // $20 for 500 credits (Growth)
      '1000': 35, // $35 for 1000 credits (Scale)
    };
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        credits: creditPackage,
        price: prices[creditPackage],
      }
    });
    if (error) {
      console.error('Error from edge function:', error);
      throw error;
    }
    console.log('Checkout session created:', data);
    // Return the URL for the checkout session
    return data.url;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function verifyPayment(sessionId?: string | null) {
  try {
    console.log('Verifying payment with session ID:', sessionId);
    const body: any = {};
    if (sessionId) {
      body.session_id = sessionId;
    }
    const { data, error } = await supabase.functions.invoke('check-payment', {
      body: body
    });
    if (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
    console.log('Payment verification result:', data);
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}
