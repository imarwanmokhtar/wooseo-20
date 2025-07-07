
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
    console.log("=== CHECK PAYMENT FUNCTION STARTED ===");
    
    const requestBody = await req.json();
    console.log("Request body:", requestBody);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ 
        success: false,
        error: "No authorization header provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const token = authHeader.replace("Bearer ", "");
    console.log("Attempting to authenticate user");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error("User authentication error:", userError);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Authentication failed: " + userError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    if (!userData.user) {
      console.error("No user data returned");
      return new Response(JSON.stringify({ 
        success: false,
        error: "User not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("User authenticated successfully:", userData.user.email);

    // Create Supabase admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Use the Stripe key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY environment variable not set");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Stripe configuration missing" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Initializing Stripe...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if session_id is provided
    if (!requestBody.session_id) {
      console.error("No session_id provided in request");
      return new Response(JSON.stringify({ 
        success: false,
        error: "No session ID provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Retrieving Stripe session:", requestBody.session_id);
    
    let session;
    try {
      // Retrieve the checkout session
      session = await stripe.checkout.sessions.retrieve(requestBody.session_id, {
        expand: ['line_items', 'payment_intent']
      });
      console.log("Session retrieved:", {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        metadata: session.metadata,
        created: session.created,
        expires_at: session.expires_at
      });
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      
      // Handle specific Stripe errors
      if (stripeError.code === 'resource_missing') {
        return new Response(JSON.stringify({ 
          success: false,
          error: "Payment session not found or has expired. Please try making a new purchase." 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: "Failed to retrieve payment session: " + stripeError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if session has expired
    if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
      console.log("Session has expired");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Payment session has expired. Please try making a new purchase." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if payment is complete
    if (session.status !== "complete" || session.payment_status !== "paid") {
      console.log("Payment not completed. Status:", session.status, "Payment status:", session.payment_status);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Payment not completed. Status: ${session.status}, Payment status: ${session.payment_status}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Payment is complete and paid");
    
    // Check if already processed
    const { data: existingPayment } = await supabaseAdmin
      .from('processed_payments')
      .select('*')
      .eq('session_id', session.id)
      .single();

    if (existingPayment) {
      console.log("Payment already processed");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Payment already processed",
        credits_added: existingPayment.credits_added
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Process the payment based on metadata
    const metadata = session.metadata;
    console.log("Processing payment with metadata:", metadata);

    if (metadata?.type === 'one-time' && metadata?.credits) {
      // Credit purchase
      const creditsToAdd = parseInt(metadata.credits);
      console.log("Adding credits to user:", creditsToAdd);
      
      // Get current user credits
      const { data: currentUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userData.user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current user credits:', fetchError);
        return new Response(JSON.stringify({ 
          success: false,
          error: "Failed to fetch user data: " + fetchError.message 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const newCreditsTotal = (currentUser?.credits || 0) + creditsToAdd;
      console.log("Current credits:", currentUser?.credits, "Adding:", creditsToAdd, "New total:", newCreditsTotal);

      // Update user credits
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          credits: newCreditsTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.user.id);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return new Response(JSON.stringify({ 
          success: false,
          error: "Failed to update credits: " + updateError.message 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log("Successfully updated user credits");

      // Record payment
      const { error: insertError } = await supabaseAdmin
        .from('processed_payments')
        .insert({
          user_id: userData.user.id,
          session_id: session.id,
          credits_added: creditsToAdd,
          processed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error recording payment:', insertError);
        // Don't fail the request since credits were already added
      }

      console.log("Payment processing completed successfully");

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully added ${creditsToAdd} credits`,
        credits_added: creditsToAdd
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (metadata?.type === 'lifetime' && metadata?.plan === 'bulk-editor-lifetime') {
      // Handle lifetime subscription
      console.log("Processing lifetime bulk editor subscription");
      
      // Update user with lifetime access
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          bulk_editor_subscription: true,
          bulk_editor_lifetime_access: true,
          bulk_editor_subscription_end: null, // null means unlimited access
          bulk_editor_subscription_type: 'lifetime',
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.user.id);

      if (updateError) {
        console.error('Error updating user subscription:', updateError);
        return new Response(JSON.stringify({ 
          success: false,
          error: "Failed to update subscription: " + updateError.message 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log("Successfully updated user with lifetime access");

      // Record payment
      const { error: insertError } = await supabaseAdmin
        .from('processed_payments')
        .insert({
          user_id: userData.user.id,
          session_id: session.id,
          subscription_plan: 'bulk-editor-lifetime',
          processed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error recording payment:', insertError);
        // Don't fail the request since subscription was already granted
      }

      console.log("Lifetime subscription processing completed successfully");

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Successfully activated lifetime bulk editor access",
        subscription_plan: 'bulk-editor-lifetime'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (metadata?.type === 'subscription' && (metadata?.plan === 'bulk-editor-monthly' || metadata?.plan === 'bulk-editor-annual')) {
      // Handle monthly/annual subscriptions
      console.log("Processing bulk editor subscription:", metadata.plan);
      
      // Get current user data first to check existing subscription
      const { data: currentUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('bulk_editor_subscription_end, bulk_editor_lifetime_access')
        .eq('id', userData.user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current user subscription data:', fetchError);
        return new Response(JSON.stringify({ 
          success: false,
          error: "Failed to fetch user data: " + fetchError.message 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      // If user has lifetime access, don't modify it
      if (currentUser?.bulk_editor_lifetime_access) {
        console.log("User already has lifetime access, skipping subscription update");
        return new Response(JSON.stringify({ 
          success: true, 
          message: "User already has lifetime access",
          subscription_plan: 'bulk-editor-lifetime'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Calculate subscription end date
      let subscriptionEnd: Date;
      const now = new Date();
      
      // If user has an existing subscription that hasn't expired, extend from that date
      let startDate = now;
      if (currentUser?.bulk_editor_subscription_end) {
        const existingEnd = new Date(currentUser.bulk_editor_subscription_end);
        if (existingEnd > now) {
          startDate = existingEnd;
          console.log("Extending existing subscription from:", existingEnd.toISOString());
        }
      }

      if (metadata.plan === 'bulk-editor-monthly') {
        // Add exactly 30 days for monthly subscription
        subscriptionEnd = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      } else if (metadata.plan === 'bulk-editor-annual') {
        // Add exactly 365 days for annual subscription
        subscriptionEnd = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
      } else {
        throw new Error("Invalid subscription plan");
      }

      console.log("Calculated subscription end date:", subscriptionEnd.toISOString());

      // Update user with subscription access
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          bulk_editor_subscription: true,
          bulk_editor_lifetime_access: false,
          bulk_editor_subscription_end: subscriptionEnd.toISOString(),
          bulk_editor_subscription_type: metadata.plan === 'bulk-editor-monthly' ? 'monthly' : 'annual',
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.user.id);

      if (updateError) {
        console.error('Error updating user subscription:', updateError);
        return new Response(JSON.stringify({ 
          success: false,
          error: "Failed to update subscription: " + updateError.message 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log("Successfully updated user with subscription access");

      // Record payment
      const { error: insertError } = await supabaseAdmin
        .from('processed_payments')
        .insert({
          user_id: userData.user.id,
          session_id: session.id,
          subscription_plan: metadata.plan,
          subscription_end: subscriptionEnd.toISOString(),
          processed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error recording payment:', insertError);
        // Don't fail the request since subscription was already granted
      }

      console.log("Subscription processing completed successfully");

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully activated ${metadata.plan} subscription`,
        subscription_plan: metadata.plan,
        subscription_end: subscriptionEnd.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle other payment types (subscriptions, etc.) here
    console.log("Unknown payment type or missing metadata");
    return new Response(JSON.stringify({ 
      success: false,
      error: "Unknown payment type or missing metadata" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error: any) {
    console.error("=== UNEXPECTED ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: "Internal server error: " + (error.message || "Unknown error")
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
