import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petData, formData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { breed, category, ageMonths, gender } = petData;
    const { living, hasChildren, freeTime, budgetMin, budgetMax } = formData;

    const prompt = `You are a professional pet care advisor. Generate a PERSONALIZED care compatibility report.

PET DETAILS:
- Breed: ${breed}
- Category: ${category}
- Age: ${ageMonths} months
- Gender: ${gender || "unknown"}

USER'S LIFESTYLE:
- Living situation: ${living}
- Has children under 18: ${hasChildren ? "Yes" : "No"}
- Daily free time: ${freeTime}
- Monthly budget range: ₹${budgetMin} - ₹${budgetMax}

Based on real, factual breed-specific data and the user's lifestyle inputs, generate a care compatibility report. Be honest — if the pet is NOT a good match for the user's lifestyle, say so clearly. Consider space needs, exercise requirements, child-friendliness, time commitment, and realistic monthly costs for Indian market.

You MUST respond using the suggest_care_plan tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_care_plan",
              description: "Return a personalized pet care compatibility report.",
              parameters: {
                type: "object",
                properties: {
                  compatibilityScore: {
                    type: "number",
                    description: "0-100 score of how well this pet matches the user's lifestyle. Be realistic and honest.",
                  },
                  tagline: {
                    type: "string",
                    description: "A short 3-5 word personality tagline for this breed, e.g. 'Smart & Loyal Companion'",
                  },
                  feeding: {
                    type: "string",
                    description: "Brief feeding recommendation for this breed at this age, e.g. 'High-quality puppy food, 3 meals/day'",
                  },
                  exercise: {
                    type: "string",
                    description: "Exercise needs based on breed and user's available time, e.g. '60 mins of active play and walks'",
                  },
                  grooming: {
                    type: "string",
                    description: "Grooming needs for this breed, e.g. 'Weekly brushing required'",
                  },
                  monthlyCost: {
                    type: "string",
                    description: "Realistic monthly cost estimate in INR for this breed in Indian market, e.g. '₹3,000 - ₹5,000'",
                  },
                  verdict: {
                    type: "string",
                    description: "One sentence suitability verdict based on user's lifestyle. Be honest if it's not a good match.",
                  },
                },
                required: ["compatibilityScore", "tagline", "feeding", "exercise", "grooming", "monthlyCost", "verdict"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_care_plan" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("care-plan-generate error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
