
import { supabase } from '@/integrations/supabase/client';

export const createSubscription = async (plan: '200' | 'bulk-editor') => {
  try {
    console.log('Creating checkout session for plan:', plan);
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('User not authenticated:', authError);
      throw new Error('Please log in to purchase credits');
    }

    console.log('User authenticated:', user.email);
    
    let body;
    if (plan === '200') {
      // One-time payment for 200 credits
      body = { 
        credits: '200',
        price: 20,
        type: 'one-time'
      };
    } else if (plan === 'bulk-editor') {
      // Monthly subscription for bulk editor
      body = {
        plan: 'bulk-editor',
        price: 9,
        type: 'subscription'
      };
    }
    
    console.log('Request body:', body);
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: body
    });
    
    if (error) {
      console.error('Error from edge function:', error);
      throw new Error(`Payment setup failed: ${error.message}`);
    }
    
    if (!data || !data.url) {
      console.error('No checkout URL returned:', data);
      throw new Error('Failed to create checkout session');
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
