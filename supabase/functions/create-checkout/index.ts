
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating checkout session...");
    console.log("Available environment variables:", Object.keys(Deno.env.toObject()));
    
    // Get the request body
    const requestBody = await req.json();
    console.log("Request data:", requestBody);

    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("Authentication failed:", userError);
      throw new Error("User not authenticated");
    }

    console.log("User authenticated:", userData.user.email);

    // Check if Stripe secret key is available and trim any whitespace/newlines
    const rawStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeSecretKey = rawStripeKey?.replace(/\r?\n/g, '').trim();
    console.log("Raw Stripe key:", rawStripeKey ? `${rawStripeKey.length} chars` : "Not found");
    console.log("Cleaned Stripe key:", stripeSecretKey ? `${stripeSecretKey.length} chars` : "Not found");
    console.log("Stripe secret key starts with:", stripeSecretKey ? stripeSecretKey.substring(0, 7) + "..." : "N/A");
    
    if (!stripeSecretKey || stripeSecretKey.length === 0) {
      console.error("Stripe secret key not found or empty after cleaning");
      console.error("Available env vars:", Object.keys(Deno.env.toObject()));
      throw new Error("Stripe configuration missing");
    }

    console.log("Stripe secret key found and cleaned, initializing Stripe...");

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: userData.user.email, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing customer found:", customerId);
    } else {
      console.log("Creating new customer");
    }

    // Get the origin and ensure it's properly formatted
    const origin = req.headers.get("origin") || "https://wooseo.lovable.app";
    console.log("Origin for redirect URLs:", origin);

    let sessionConfig;

    if (requestBody.type === 'one-time') {
      // One-time payment for credits
      sessionConfig = {
        customer: customerId,
        customer_email: customerId ? undefined : userData.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${requestBody.credits} Credits`,
                description: `${requestBody.credits} credits for AI SEO content generation`,
              },
              unit_amount: requestBody.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard`,
        metadata: {
          user_id: userData.user.id,
          credits: requestBody.credits ? requestBody.credits.toString() : '0',
          type: 'one-time'
        },
      };
    } else if (requestBody.type === 'subscription') {
      // Monthly subscription for bulk editor
      sessionConfig = {
        customer: customerId,
        customer_email: customerId ? undefined : userData.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Unlimited Bulk Editor",
                description: "Monthly subscription for unlimited bulk editing capabilities",
              },
              unit_amount: requestBody.price * 100, // Convert to cents
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard`,
        metadata: {
          user_id: userData.user.id,
          plan: requestBody.plan,
          type: 'subscription'
        },
      };
    } else {
      throw new Error("Invalid payment type");
    }

    console.log("Creating checkout session with config:", JSON.stringify(sessionConfig, null, 2));

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("Checkout session created successfully:", session.id);
    console.log("Checkout URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Check the edge function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
