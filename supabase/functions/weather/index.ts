import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Karnataka district name mappings to better city names for OpenWeatherMap
const districtCityMappings: Record<string, string> = {
  'BANGALORE RURAL': 'Bangalore',
  'BANGALORE URBAN': 'Bangalore',
  'BELGAUM': 'Belgaum',
  'BELLARY': 'Bellary',
  'BIDAR': 'Bidar',
  'BIJAPUR': 'Bijapur',
  'CHAMARAJANAGAR': 'Chamarajanagar',
  'CHIKMAGALUR': 'Chikmagalur',
  'CHITRADURGA': 'Chitradurga',
  'DAKSHIN KANNAD': 'Mangalore',  // Dakshin Kannada capital
  'DAVANGERE': 'Davanagere',
  'DHARWAD': 'Dharwad',
  'GADAG': 'Gadag',
  'GULBARGA': 'Gulbarga',
  'HASSAN': 'Hassan',
  'HAVERI': 'Haveri',
  'KODAGU': 'Madikeri',  // Kodagu capital
  'KOLAR': 'Kolar',
  'KOPPAL': 'Koppal',
  'MANDYA': 'Mandya',
  'MYSORE': 'Mysore',
  'RAICHUR': 'Raichur',
  'RAMANAGARA': 'Ramanagara',
  'SHIMOGA': 'Shimoga',
  'TUMKUR': 'Tumkur',
  'UDUPI': 'Udupi',
  'UTTAR KANNAD': 'Karwar',  // Uttar Kannada capital
  'YADGIR': 'Yadgir',
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

    // Map district to city name that OpenWeatherMap recognizes
    const cityName = districtCityMappings[district.toUpperCase()] || district;
    const location = `${cityName},IN`;  // Use country code for better accuracy
    console.log(`Fetching weather for: ${cityName} (district: ${district})`);

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather API error:', errorText);
      
      // Try with just city name if country code fails
      const fallbackUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (!fallbackResponse.ok) {
        console.error('Fallback weather API also failed');
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch weather data',
            temperature: 28,
            humidity: 65,
            rainfall: 0,
            description: 'Weather data unavailable',
            location: district
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const weatherData = await fallbackResponse.json();
      return processWeatherData(weatherData, district, corsHeaders);
    }

    const weatherData = await weatherResponse.json();
    return processWeatherData(weatherData, district, corsHeaders);
    
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

function processWeatherData(weatherData: any, district: string, corsHeaders: Record<string, string>) {
  console.log('Weather data received:', JSON.stringify(weatherData));

  // Calculate estimated rainfall from various sources
  // rain.1h = rainfall in last 1 hour
  // rain.3h = rainfall in last 3 hours  
  // If neither available, estimate from humidity and weather conditions
  let rainfall = 0;
  if (weatherData.rain) {
    rainfall = weatherData.rain['1h'] || (weatherData.rain['3h'] ? weatherData.rain['3h'] / 3 : 0);
  } else if (weatherData.weather?.[0]?.main === 'Rain' || weatherData.weather?.[0]?.main === 'Drizzle') {
    // Estimate light rain based on weather description
    rainfall = weatherData.main?.humidity > 80 ? 2 : 1;
  }

  const result = {
    temperature: weatherData.main?.temp || 28,
    humidity: weatherData.main?.humidity || 65,
    pressure: weatherData.main?.pressure || 1013,
    wind_speed: weatherData.wind?.speed || 0,
    description: weatherData.weather?.[0]?.description || 'Clear',
    icon: weatherData.weather?.[0]?.icon || '01d',
    location: weatherData.name || district,
    rainfall: rainfall,
    // Additional data for ML model
    feels_like: weatherData.main?.feels_like || weatherData.main?.temp || 28,
    clouds: weatherData.clouds?.all || 0,
    visibility: weatherData.visibility || 10000,
  };

  console.log('Processed weather result:', JSON.stringify(result));

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
