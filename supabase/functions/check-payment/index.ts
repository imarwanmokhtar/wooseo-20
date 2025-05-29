
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking payment status...");

    // Get session_id from URL params or body
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    
    let bodySessionId;
    if (!sessionId) {
      try {
        const body = await req.json();
        bodySessionId = body.session_id;
      } catch {
        // No body or invalid JSON
      }
    }

    const finalSessionId = sessionId || bodySessionId;
    console.log("Session ID:", finalSessionId);

    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    console.log("User authenticated:", userData.user.email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    if (finalSessionId) {
      // Check if this payment has already been processed
      const { data: existingPayment } = await supabaseClient
        .from('processed_payments')
        .select('id')
        .eq('session_id', finalSessionId)
        .eq('user_id', userData.user.id)
        .single();

      if (existingPayment) {
        console.log("Payment already processed for session:", finalSessionId);
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Payment already processed",
          credits_added: 0
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Verify specific session
      console.log("Verifying session:", finalSessionId);
      const session = await stripe.checkout.sessions.retrieve(finalSessionId);
      
      if (session.payment_status === 'paid' && session.metadata?.user_id === userData.user.id) {
        const creditsToAdd = parseInt(session.metadata.credits || '0');
        console.log("Payment verified, adding credits:", creditsToAdd);
        
        // Get current user credits
        const { data: currentUser, error: fetchError } = await supabaseClient
          .from('users')
          .select('credits')
          .eq('id', userData.user.id)
          .single();

        if (fetchError) {
          console.error("Error fetching current credits:", fetchError);
          throw fetchError;
        }

        const newCredits = (currentUser?.credits || 0) + creditsToAdd;
        console.log("Updating credits from", currentUser?.credits, "to", newCredits);

        // Update user credits
        const { error: updateError } = await supabaseClient
          .from('users')
          .update({ credits: newCredits })
          .eq('id', userData.user.id);

        if (updateError) {
          console.error("Error updating credits:", updateError);
          throw updateError;
        }

        // Mark payment as processed
        const { error: paymentError } = await supabaseClient
          .from('processed_payments')
          .insert({
            session_id: finalSessionId,
            user_id: userData.user.id,
            credits_added: creditsToAdd,
            processed_at: new Date().toISOString()
          });

        if (paymentError) {
          console.error("Error recording processed payment:", paymentError);
          // Don't throw error here as credits were already added
        }

        console.log("Credits updated successfully");
        return new Response(JSON.stringify({ 
          success: true, 
          credits_added: creditsToAdd,
          new_total: newCredits 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        console.log("Payment not completed or user mismatch");
        return new Response(JSON.stringify({ 
          success: false, 
          message: "Payment not completed" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "No session ID provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error checking payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
