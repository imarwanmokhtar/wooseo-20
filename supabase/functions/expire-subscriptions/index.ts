
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log("Starting subscription expiration check...");

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all users with expired subscriptions
    const { data: expiredUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, bulk_editor_subscription_end')
      .eq('bulk_editor_subscription', true)
      .not('bulk_editor_subscription_end', 'is', null)
      .lt('bulk_editor_subscription_end', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredUsers?.length || 0} expired subscriptions`);

    if (expiredUsers && expiredUsers.length > 0) {
      // Update expired subscriptions
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          bulk_editor_subscription: false,
          bulk_editor_subscription_end: null
        })
        .in('id', expiredUsers.map(user => user.id));

      if (updateError) {
        console.error('Error updating expired subscriptions:', updateError);
        throw updateError;
      }

      console.log(`Successfully expired ${expiredUsers.length} subscriptions`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      expired_count: expiredUsers?.length || 0,
      message: `Processed ${expiredUsers?.length || 0} expired subscriptions`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in expire-subscriptions function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
