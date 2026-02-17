import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { breed, category, ageMonths, gender } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a veterinary expert AI. Generate accurate, breed-specific pet care insights for:
- Breed: ${breed}
- Category: ${category}
- Age: ${ageMonths} months
- Gender: ${gender}

Return a JSON object with this EXACT structure (no markdown, no code blocks, just raw JSON):
{
  "quick": {
    "nutrition": {
      "title": "Nutrition Focus",
      "text": "2-3 sentences about nutrition needs specific to this breed and age"
    },
    "activity": {
      "title": "Activity Level",
      "text": "2-3 sentences about activity/exercise needs specific to this breed and age"
    },
    "lifespan": {
      "title": "Avg Lifespan",
      "text": "2-3 sentences about typical lifespan and longevity tips for this breed"
    }
  },
  "deep": {
    "health": {
      "title": "Health & Genetics",
      "text": "4-6 sentences about breed-specific health concerns, genetic predispositions, recommended screenings"
    },
    "training": {
      "title": "Training & Temperament",
      "text": "4-6 sentences about temperament, trainability, socialization needs"
    },
    "grooming": {
      "title": "Grooming & Care",
      "text": "4-6 sentences about coat care, grooming frequency, seasonal needs"
    }
  }
}

Be accurate, specific to the breed, and consider the age. Do NOT use generic advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    const insights = JSON.parse(content);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pet-ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
