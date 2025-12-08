import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state, district, season, weather, currentYield, currentCrop } = await req.json();
    console.log(`Optimization request for ${district}, ${state}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are an agricultural expert AI. Based on the following conditions, provide detailed optimization recommendations for maximizing crop yield:

Location: ${district}, ${state}, India
Season: ${season}
Current Crop: ${currentCrop}
Current Predicted Yield: ${currentYield} kg/hectare
${weather ? `Weather: Temperature ${weather.temperature}°C, Humidity ${weather.humidity}%, Rainfall ${weather.rainfall}mm` : ''}

Provide recommendations in the following format:
1. Soil preparation tips (2-3 sentences)
2. Irrigation advice (2-3 sentences)
3. Fertilizer recommendations (2-3 sentences)
4. Pest control measures (2-3 sentences)
5. Harvest timing advice (1-2 sentences)

Keep the response concise and actionable for farmers.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert agricultural advisor helping Indian farmers optimize their crop yields.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to get AI recommendations');
    }

    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content || 'Unable to generate recommendations at this time.';

    console.log('Optimization recommendations generated successfully');
    return new Response(
      JSON.stringify({ 
        status: 'success',
        recommendations,
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Optimization error:', error);
    return new Response(
      JSON.stringify({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
