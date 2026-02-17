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

    const prompt = `You are a veterinary information assistant. Generate accurate, breed-specific pet care insights.

Pet details:
- Breed: ${breed}
- Category: ${category}
- Age: ${ageMonths} months
- Gender: ${gender}

CRITICAL RULES:
- Professional, calm, informative tone only.
- No marketing language, no exaggeration, no emojis, no storytelling, no filler words.
- No repetition across sections.
- No speculative claims, no guarantees.
- Fact-based and concise only.
- Use cautious phrasing where uncertainty exists: "commonly seen," "may require," "typically."
- No breed praise language. No emotional persuasion.
- No unwanted, illegal, or 18+ wording.
- IMPORTANT: Vary your wording significantly each time. Do not produce identical phrasing across requests for the same breed. Rephrase sentences, reorder points, and use synonyms naturally so no two outputs are word-for-word the same.

Return a JSON object with this EXACT structure (no markdown, no code blocks, just raw JSON):
{
  "quick": {
    "nutrition": {
      "title": "Nutrition Focus",
      "text": "EXACTLY 2 sentences. Sentence 1: core dietary trait or requirement. Sentence 2: practical feeding implication. Keep within 2 mobile lines."
    },
    "activity": {
      "title": "Activity Level",
      "text": "EXACTLY 2 sentences. Sentence 1: core activity trait. Sentence 2: practical exercise implication. Keep within 2 mobile lines."
    },
    "lifespan": {
      "title": "Avg Lifespan",
      "text": "EXACTLY 2 sentences. Sentence 1: typical lifespan range. Sentence 2: key longevity factor. Keep within 2 mobile lines."
    }
  },
  "deep": {
    "health": {
      "title": "Health & Genetics",
      "text": "EXACTLY 4 sentences max. Do NOT repeat Quick Facts content. Sentence 1: primary health concern. Sentence 2: context or explanation. Sentence 3: care or management approach. Sentence 4: preventive or monitoring recommendation."
    },
    "training": {
      "title": "Training & Temperament",
      "text": "EXACTLY 4 sentences max. Do NOT repeat Quick Facts content. Sentence 1: primary temperament trait. Sentence 2: context. Sentence 3: training approach. Sentence 4: socialization note."
    },
    "grooming": {
      "title": "Grooming & Care",
      "text": "EXACTLY 4 sentences max. Do NOT repeat Quick Facts content. Sentence 1: coat or care type. Sentence 2: grooming frequency. Sentence 3: seasonal or special needs. Sentence 4: maintenance recommendation."
    }
  }
}

Be accurate and specific to the breed and age. No generic advice.`;

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
