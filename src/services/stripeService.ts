import { supabase } from '@/integrations/supabase/client';

export async function createSubscription(creditPackage: '200' | '1000' | '2000') {
  try {
    console.log('Creating checkout session for credit package:', creditPackage);
    
    // Define package prices
    const prices = {
      '200': 5, // $5 for 200 credits
      '1000': 20, // $20 for 1000 credits
      '2000': 35, // $35 for 2000 credits
    };
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        credits: creditPackage,
        price: prices[creditPackage]
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
    
    const body: { session_id?: string } = {};
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
