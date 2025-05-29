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
    
    // Get the request body
    const { credits, price, isLimitedOffer } = await req.json();
    console.log("Request data:", { credits, price, isLimitedOffer });

    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    // If it's a limited offer, check if user has already purchased
    if (isLimitedOffer) {
      const { data: existingPurchase, error: purchaseError } = await supabaseClient
        .from('limited_offer_purchases')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (purchaseError && purchaseError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw purchaseError;
      }

      if (existingPurchase) {
        throw new Error("You have already purchased the limited offer");
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} Credits Package`,
              description: isLimitedOffer ? "Limited Offer - First 100 Users" : "Standard Credit Package",
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${Deno.env.get("FRONTEND_URL")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("FRONTEND_URL")}/payment-cancelled`,
      metadata: {
        user_id: userData.user.id,
        credits: credits,
        is_limited_offer: isLimitedOffer ? "true" : "false"
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
