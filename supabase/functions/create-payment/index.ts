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
    console.log("Payment request received");
    
    // Parse request body
    const { priceId, productType = "game_access" } = await req.json();
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let userId = null;
    let customerEmail = "guest@example.com";

    // Try to get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user?.email) {
          userId = data.user.id;
          customerEmail = data.user.email;
        }
      } catch (error) {
        console.log("No authenticated user, proceeding as guest");
      }
    }

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Define pricing
    const pricing = {
      game_access: { amount: 4999, name: "Eclipse Realms - Full Game Access" },
      battle_pass: { amount: 999, name: "Eclipse Realms - Season Battle Pass" },
      cosmetic: { amount: 299, name: "Eclipse Realms - Cosmetic Item" }
    };

    const selectedProduct = pricing[productType as keyof typeof pricing] || pricing.game_access;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: selectedProduct.name,
              description: productType === "game_access" 
                ? "Unlock the full Eclipse Realms experience with all realms, characters, and features."
                : productType === "battle_pass"
                ? "Access exclusive rewards, cosmetics, and challenges for the current season."
                : "Premium cosmetic item for your character."
            },
            unit_amount: selectedProduct.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        product_type: productType,
        user_id: userId || "guest"
      }
    });

    // Record order in database if user is authenticated
    if (userId) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      await supabaseService.from("orders").insert({
        user_id: userId,
        stripe_session_id: session.id,
        amount: selectedProduct.amount,
        product_type: productType,
        status: "pending",
      });
    }

    console.log("Payment session created successfully");
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});