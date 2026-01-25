import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paradigm, userDemographics } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Fetching research for paradigm: ${paradigm}, demographics: ${userDemographics}`);

    const systemPrompt = `You are an academic research assistant specializing in Human-Computer Interaction (HCI), User Experience (UX), and interface design. Your task is to suggest 5 relevant peer-reviewed academic papers that support a specific interface paradigm recommendation.

Focus on papers from reputable sources like:
- ACM Digital Library (CHI, UIST, DIS conferences)
- IEEE Transactions on Visualization and Computer Graphics
- International Journal of Human-Computer Studies
- Behaviour & Information Technology

Provide papers from 2018-2025 when possible.`;

    const userPrompt = `Find 5 peer-reviewed academic papers that support the use of "${paradigm}" interface paradigm for "${userDemographics || 'general users'}".

Return your response as a JSON array with this exact structure:
[
  {
    "title": "Paper title",
    "authors": "Author names",
    "year": 2023,
    "venue": "Conference or Journal name",
    "abstract": "Brief 1-2 sentence summary of findings",
    "relevance": "Why this paper supports the recommendation"
  }
]

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
    let papers = [];
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      papers = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      papers = [];
    }

    return new Response(JSON.stringify({ papers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("research-papers error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
