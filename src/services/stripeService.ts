
import { supabase } from '@/integrations/supabase/client';

export const createSubscription = async (plan: '200' | '500' | '1000' | 'bulk-editor-monthly' | 'bulk-editor-annual' | 'bulk-editor-lifetime') => {
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
      body = { 
        credits: '200',
        price: 20,
        type: 'one-time'
      };
    } else if (plan === '500') {
      body = { 
        credits: '500',
        price: 40,
        type: 'one-time'
      };
    } else if (plan === '1000') {
      body = { 
        credits: '1000',
        price: 75,
        type: 'one-time'
      };
    } else if (plan === 'bulk-editor-monthly') {
      body = {
        plan: 'bulk-editor-monthly',
        price: 9,
        type: 'subscription'
      };
    } else if (plan === 'bulk-editor-annual') {
      body = {
        plan: 'bulk-editor-annual',
        price: 29,
        type: 'subscription'
      };
    } else if (plan === 'bulk-editor-lifetime') {
      body = {
        plan: 'bulk-editor-lifetime',
        price: 99,
        type: 'one-time'
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
    return data.url;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function verifyPayment(sessionId?: string | null) {
  try {
    console.log('=== VERIFY PAYMENT SERVICE ===');
    console.log('Verifying payment with session ID:', sessionId);
    
    // Ensure user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed: ' + authError.message);
    }
    
    if (!user) {
      console.error('No user found');
      throw new Error('Please log in to verify your payment');
    }

    console.log('User authenticated:', user.email);

    if (!sessionId) {
      console.error('No session ID provided');
      throw new Error('No session ID provided');
    }

    const body = { session_id: sessionId };
    console.log('Calling check-payment function with body:', body);
    
    const { data, error } = await supabase.functions.invoke('check-payment', {
      body: body
    });
    
    console.log('Function response data:', data);
    console.log('Function response error:', error);
    
    if (error) {
      console.error('Edge function error:', error);
      // Provide more specific error message
      const errorMessage = error.message || 'Edge Function returned a non-2xx status code';
      throw new Error(`Payment verification failed: ${errorMessage}`);
    }
    
    if (!data) {
      console.error('No data returned from function');
      throw new Error('No response data from payment verification');
    }
    
    console.log('Payment verification completed successfully:', data);
    return data;
  } catch (error) {
    console.error('=== ERROR IN VERIFY PAYMENT ===');
    console.error('Error details:', error);
    throw error;
  }
}
