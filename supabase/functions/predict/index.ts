import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Crop yield baseline data (kg/hectare) - simulated ML model output
const cropYieldData: Record<string, Record<string, number>> = {
  'Rice': { 'Kharif': 2800, 'Rabi': 3200, 'Whole Year': 3000, 'Autumn': 2600 },
  'Wheat': { 'Kharif': 2000, 'Rabi': 3500, 'Whole Year': 2800, 'Autumn': 2200 },
  'Maize': { 'Kharif': 2500, 'Rabi': 2800, 'Whole Year': 2650, 'Autumn': 2300 },
  'Groundnut': { 'Kharif': 1800, 'Rabi': 2000, 'Whole Year': 1900, 'Autumn': 1600 },
  'Jowar': { 'Kharif': 1200, 'Rabi': 1500, 'Whole Year': 1350, 'Autumn': 1100 },
  'Arhar/Tur': { 'Kharif': 900, 'Rabi': 1100, 'Whole Year': 1000, 'Autumn': 850 },
  'Bajra': { 'Kharif': 1100, 'Rabi': 1300, 'Whole Year': 1200, 'Autumn': 1000 },
};

// District-based soil quality multiplier
const districtMultipliers: Record<string, number> = {
  'BANGALORE RURAL': 1.15,
  'BANGALORE URBAN': 1.0,
  'BELGAUM': 1.2,
  'BELLARY': 1.1,
  'BIDAR': 1.05,
  'BIJAPUR': 1.0,
  'CHAMARAJANAGAR': 1.1,
  'CHIKMAGALUR': 1.25,
  'CHITRADURGA': 1.08,
  'DAKSHIN KANNAD': 1.3,
  'DAVANGERE': 1.12,
  'DHARWAD': 1.18,
  'GADAG': 1.05,
  'GULBARGA': 1.0,
  'HASSAN': 1.22,
  'HAVERI': 1.15,
  'KODAGU': 1.35,
  'KOLAR': 1.08,
  'KOPPAL': 1.02,
  'MANDYA': 1.2,
  'MYSORE': 1.18,
  'RAICHUR': 1.05,
  'RAMANAGARA': 1.12,
  'SHIMOGA': 1.28,
  'TUMKUR': 1.1,
  'UDUPI': 1.32,
  'UTTAR KANNAD': 1.25,
  'YADGIR': 1.0,
  'ANANTAPUR': 0.95,
  'PURULIA': 0.98,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state, district, crop, season, year, weather } = await req.json();
    console.log(`Prediction request: ${crop} in ${district}, ${state} for ${season} ${year}`);

    // Get base yield for crop and season
    const baseYield = cropYieldData[crop]?.[season] || 2000;
    
    // Apply district multiplier
    const districtMult = districtMultipliers[district] || 1.0;
    
    // Apply weather-based adjustments if available
    let weatherMult = 1.0;
    if (weather) {
      // Optimal conditions: 25-30°C, 60-80% humidity
      const tempFactor = weather.temperature >= 20 && weather.temperature <= 35 ? 1.0 : 0.9;
      const humidityFactor = weather.humidity >= 50 && weather.humidity <= 85 ? 1.0 : 0.95;
      weatherMult = tempFactor * humidityFactor;
    }
    
    // Year trend factor (slight increase over years due to better techniques)
    const yearFactor = 1 + ((year - 1997) * 0.005);
    
    // Random variation (simulating model uncertainty)
    const variation = 0.95 + Math.random() * 0.1;
    
    // Calculate predicted yield
    const predictedYield = baseYield * districtMult * weatherMult * yearFactor * variation;

    // Find best alternative crop for optimization
    let recommendedCrop: string | null = null;
    let estimatedGain = 0;
    
    const crops = Object.keys(cropYieldData);
    for (const altCrop of crops) {
      if (altCrop === crop) continue;
      
      const altBaseYield = cropYieldData[altCrop]?.[season] || 0;
      const altPredicted = altBaseYield * districtMult * weatherMult * yearFactor;
      
      if (altPredicted > predictedYield + 100) {
        const gain = altPredicted - predictedYield;
        if (gain > estimatedGain) {
          estimatedGain = Math.round(gain);
          recommendedCrop = altCrop;
        }
      }
    }

    const result = {
      status: 'success',
      current_yield: Math.round(predictedYield * 100) / 100,
      recommended_crop: recommendedCrop,
      estimated_gain: estimatedGain > 0 ? estimatedGain : null,
      confidence: 0.85 + Math.random() * 0.1,
      factors: {
        base_yield: baseYield,
        district_multiplier: districtMult,
        weather_multiplier: weatherMult,
        year_factor: yearFactor,
      },
      message: recommendedCrop 
        ? `Consider switching to ${recommendedCrop} for potentially higher yields.`
        : 'Your current crop selection is optimal for these conditions.',
    };

    console.log('Prediction result:', JSON.stringify(result));
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Prediction error:', error);
    return new Response(
      JSON.stringify({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
