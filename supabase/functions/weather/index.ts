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
    const { district, state } = await req.json();
    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');

    if (!apiKey) {
      console.error('OpenWeatherMap API key not configured');
      return new Response(
        JSON.stringify({ error: 'Weather service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use district name as location query
    const location = `${district}, ${state}, India`;
    console.log(`Fetching weather for: ${location}`);

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch weather data',
          temperature: 28,
          humidity: 65,
          rainfall: 0,
          description: 'Weather data unavailable'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherData = await weatherResponse.json();
    console.log('Weather data received:', JSON.stringify(weatherData));

    const result = {
      temperature: weatherData.main?.temp || 28,
      humidity: weatherData.main?.humidity || 65,
      pressure: weatherData.main?.pressure || 1013,
      wind_speed: weatherData.wind?.speed || 0,
      description: weatherData.weather?.[0]?.description || 'Clear',
      icon: weatherData.weather?.[0]?.icon || '01d',
      location: weatherData.name || district,
      rainfall: weatherData.rain?.['1h'] || weatherData.rain?.['3h'] || 0,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Weather function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        description: 'Weather data unavailable'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
