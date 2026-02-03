import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Valid paradigm values (whitelist)
const VALID_PARADIGMS = [
  "traditional_screen",
  "invisible",
  "ai_vectorial",
  "spatial",
  "voice",
];

// Human-readable paradigm names for better AI context
const PARADIGM_NAMES: Record<string, string> = {
  traditional_screen: "Traditional Screen-based interfaces (desktop, mobile apps, websites)",
  invisible: "Invisible/Ambient Computing (IoT, smart environments, ubiquitous computing)",
  ai_vectorial: "AI-first/Conversational interfaces (chatbots, AI assistants)",
  spatial: "Spatial Computing (AR/VR, mixed reality, 3D interfaces)",
  voice: "Voice-first interfaces (voice assistants, audio-only)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    const body = await req.json();
    const { paradigm, userDemographics } = body;

    // Input validation: paradigm (required, must be from whitelist)
    if (!paradigm || typeof paradigm !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid paradigm parameter: required string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_PARADIGMS.includes(paradigm)) {
      return new Response(
        JSON.stringify({ error: `Invalid paradigm: must be one of ${VALID_PARADIGMS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation: userDemographics (optional, max 500 chars)
    if (userDemographics !== undefined && userDemographics !== null) {
      if (typeof userDemographics !== "string" || userDemographics.length > 500) {
        return new Response(
          JSON.stringify({ error: "Invalid userDemographics: must be string under 500 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sanitize inputs for prompt injection prevention
    const sanitizedParadigm = paradigm.replace(/[\n\r]/g, " ").trim();
    const paradigmDescription = PARADIGM_NAMES[sanitizedParadigm] || sanitizedParadigm;
    const sanitizedDemographics = userDemographics
      ? userDemographics.replace(/[\n\r]/g, " ").trim().slice(0, 500)
      : "general users";
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Fetching case studies for paradigm: ${sanitizedParadigm}, demographics: ${sanitizedDemographics}`);

    const systemPrompt = `You are a technology industry analyst specializing in product launches, interface design history, and UX case studies. Your task is to identify real-world products and projects that have used a specific interface paradigm, including both notable failures and successes.

Focus on well-documented, real products from recognizable companies. Include specific years and factual details. Balance between 2-3 failures and 2-3 successes.`;

    const userPrompt = `Identify 4-6 real-world case studies (mix of failures and successes) for products using the "${paradigmDescription}" paradigm, relevant to "${sanitizedDemographics}".

Return your response as a JSON array with this exact structure:
[
  {
    "name": "Product/Project name",
    "company": "Company name",
    "year": 2020,
    "outcome": "success" or "failure",
    "description": "Brief 1-2 sentence description of what the product was",
    "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
    "lessonsLearned": "Key takeaway for designers considering this paradigm"
  }
]

Requirements:
- Include real, verifiable products (not fictional)
- Provide 2-3 failures and 2-3 successes
- Focus on products from 2010-2024
- Key factors should explain WHY it succeeded or failed
- Lessons learned should be actionable for designers

Only return the JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    console.log("Raw AI response:", content);

    // Parse the JSON response
    let cases = [];
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      cases = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      cases = [];
    }

    return new Response(JSON.stringify({ cases }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("case-studies error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
