import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Créer un client Supabase avec les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🧹 [Clean Expired] Nettoyage des données Astra expirées...");

    // Appeler la fonction RPC de nettoyage
    const { data, error } = await supabase.rpc("clean_expired_astra_data");

    if (error) {
      console.error("❌ [Clean Expired] Erreur:", error);
      throw error;
    }

    const result = data?.[0] || { deleted_messages: 0, deleted_conversations: 0 };

    console.log("✅ [Clean Expired] Nettoyage terminé:", {
      messages_supprimés: result.deleted_messages,
      conversations_supprimées: result.deleted_conversations,
    });

    return new Response(
      JSON.stringify({
        success: true,
        deleted_messages: result.deleted_messages,
        deleted_conversations: result.deleted_conversations,
        message: `Nettoyage terminé : ${result.deleted_messages} messages et ${result.deleted_conversations} conversations supprimés`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ [Clean Expired] Exception:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
