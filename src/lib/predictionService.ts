export interface PredictionInput {
  state: string;
  district: string;
  crop: string;
  season: string;
}

export interface PredictionResult {
  current_yield: number;
  status: 'success' | 'error';
  recommended_crop: string | null;
  estimated_gain: number;
  message: string;
}

// Simulated prediction function
export async function get_prediction_and_optimization(
  inputData: PredictionInput
): Promise<PredictionResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock yield calculation based on inputs
  const baseYield = Math.random() * 100 + 50;
  const current_yield = Math.round(baseYield * 100) / 100;

  // Mock optimization logic
  const crops = ['Groundnut', 'Rice', 'Maize', 'Wheat', 'Jowar', 'Arhar/Tur', 'Bajra'];
  const shouldRecommend = Math.random() > 0.5;
  
  let recommended_crop: string | null = null;
  let estimated_gain = 0;

  if (shouldRecommend) {
    const otherCrops = crops.filter(c => c !== inputData.crop);
    recommended_crop = otherCrops[Math.floor(Math.random() * otherCrops.length)];
    estimated_gain = Math.round((Math.random() * 15 + 5) * 10) / 10;
  }

  return {
    current_yield,
    status: 'success',
    recommended_crop,
    estimated_gain,
    message: 'Prediction successful.'
  };
}
