import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_PARADIGMS = [
  "traditional_screen",
  "invisible",
  "ai_vectorial",
  "spatial",
  "voice",
];

// Curated search queries per interface type
const PARADIGM_QUERIES: Record<string, string> = {
  traditional_screen: "Search Google Scholar for 5 real peer-reviewed papers about direct manipulation interfaces, screen-based interaction design, and user control in desktop productivity applications. Focus on HCI and UX research from ACM CHI, IJHCS, or similar venues.",
  invisible: "Search Google Scholar for 5 real peer-reviewed papers about invisible automation, ambient computing, and user trust in background automated systems in HCI. Focus on when automation works well for users and when it fails.",
  ai_vectorial: "Search Google Scholar for 5 real peer-reviewed papers about conversational AI interfaces, user expectations in AI assistants, and human-AI interaction design. Focus on HCI research about natural language interfaces and their limitations.",
  spatial: "Search Google Scholar for 5 real peer-reviewed papers about augmented reality wearables, spatial computing user adoption, and social acceptability of head-mounted displays. Focus on HCI research about AR/VR user experience.",
  voice: "Search Google Scholar for 5 real peer-reviewed papers about voice user interfaces, speech interaction design, and limitations of voice-only interfaces for complex tasks. Focus on HCI research about voice assistants and their failure modes.",
};

// Flag-specific query enrichments
const FLAG_ENRICHMENTS: Record<string, string> = {
  "interruption-control-violation": "Include papers about automation interruption and user control rejection.",
  "hardware-redundancy": "Include papers about hardware adoption barriers and device redundancy.",
  "efficiency-ai-latency": "Include papers about AI response latency and user productivity.",
  "social-wearable-privacy": "Include papers about wearable privacy and social acceptability.",
  "ecosystem-switching-cost": "Include papers about platform switching costs and ecosystem lock-in.",
  "voice-only-modality-mismatch": "Include papers about voice interface limitations for visual tasks.",
  "battery-thermal-constraint": "Include papers about wearable hardware constraints.",
  "novelty-over-utility": "Include papers about technology novelty versus utility in adoption.",
  "biometric-regulatory-risk": "Include papers about biometric data privacy regulations.",
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
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    const body = await req.json();
    const { paradigm, userDemographics, detectedFlags } = body;

    // Input validation
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

    const GOOGLE_AI_KEY = Deno.env.get("GOOGLE_AI_STUDIO_KEY");
    if (!GOOGLE_AI_KEY) {
      throw new Error("GOOGLE_AI_STUDIO_KEY is not configured");
    }

    const sanitizedParadigm = paradigm.replace(/[\n\r]/g, " ").trim();

    // Build prompt with optional flag enrichment
    const baseQuery = PARADIGM_QUERIES[sanitizedParadigm] || PARADIGM_QUERIES["traditional_screen"];
    const flagIds: string[] = Array.isArray(detectedFlags) ? detectedFlags : [];
    const enrichments = flagIds
      .filter((id: string) => typeof id === "string" && FLAG_ENRICHMENTS[id])
      .map((id: string) => FLAG_ENRICHMENTS[id])
      .slice(0, 2)
      .join(" ");

    const prompt = `Use Google Search to find 5 real peer-reviewed papers about ${baseQuery.replace(/^Search Google Scholar for 5 real peer-reviewed papers about /, "")}${enrichments ? " " + enrichments : ""} For each paper you find, verify it exists by confirming its DOI on doi.org, ACM Digital Library, or IEEE Xplore. Only include papers with a confirmed DOI that starts with 10. Do not invent citations. Return fewer than 5 if needed.

Return as JSON array only:
[
  {
    "title": "exact title",
    "authors": "Author A, Author B",
    "year": 2019,
    "venue": "journal name",
    "abstract": "one sentence summary",
    "doi": "10.xxxx/xxxxx"
  }
]`;

    console.log(`Calling Google AI Studio for paradigm: ${sanitizedParadigm}`);

    // Call Google AI Studio directly with Google Search grounding
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI Studio error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Google AI Studio error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    console.log("Raw AI response:", content);

    // Parse JSON response
    let papers = [];
    try {
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      papers = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      papers = [];
    }

    // Filter: only papers with valid DOI starting with "10."
    const verified = papers.filter((p: any) =>
      p.doi && p.doi.startsWith("10.") && p.doi.length > 8 && p.title
    );

    return new Response(
      JSON.stringify({ papers: verified, source: "gemini_grounding" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("research-papers error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
