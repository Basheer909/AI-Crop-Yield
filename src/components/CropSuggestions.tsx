import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Droplets, Calendar, TrendingUp } from "lucide-react";
import { Language, t } from "@/lib/translations";

interface CropSuggestion {
  name: string;
  expectedYield: number;
  suitability: 'high' | 'medium' | 'low';
  waterRequirement: 'high' | 'medium' | 'low';
  growingPeriod: number;
  profitPotential: 'high' | 'medium' | 'low';
}

interface CropSuggestionsProps {
  district: string;
  season: string;
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
  } | null;
  language: Language;
}

const cropDatabase: Record<string, CropSuggestion[]> = {
  kharif: [
    { name: 'Rice', expectedYield: 3500, suitability: 'high', waterRequirement: 'high', growingPeriod: 120, profitPotential: 'high' },
    { name: 'Maize', expectedYield: 2800, suitability: 'high', waterRequirement: 'medium', growingPeriod: 90, profitPotential: 'medium' },
    { name: 'Groundnut', expectedYield: 1800, suitability: 'medium', waterRequirement: 'medium', growingPeriod: 110, profitPotential: 'high' },
    { name: 'Bajra', expectedYield: 1500, suitability: 'high', waterRequirement: 'low', growingPeriod: 75, profitPotential: 'medium' },
    { name: 'Arhar/Tur', expectedYield: 900, suitability: 'medium', waterRequirement: 'low', growingPeriod: 150, profitPotential: 'high' },
  ],
  rabi: [
    { name: 'Wheat', expectedYield: 3200, suitability: 'high', waterRequirement: 'medium', growingPeriod: 120, profitPotential: 'high' },
    { name: 'Jowar', expectedYield: 1200, suitability: 'high', waterRequirement: 'low', growingPeriod: 100, profitPotential: 'medium' },
    { name: 'Groundnut', expectedYield: 1600, suitability: 'medium', waterRequirement: 'medium', growingPeriod: 100, profitPotential: 'high' },
    { name: 'Maize', expectedYield: 2500, suitability: 'medium', waterRequirement: 'medium', growingPeriod: 85, profitPotential: 'medium' },
  ],
  'whole year': [
    { name: 'Rice', expectedYield: 3200, suitability: 'high', waterRequirement: 'high', growingPeriod: 120, profitPotential: 'high' },
    { name: 'Maize', expectedYield: 2600, suitability: 'high', waterRequirement: 'medium', growingPeriod: 90, profitPotential: 'medium' },
    { name: 'Groundnut', expectedYield: 1700, suitability: 'medium', waterRequirement: 'medium', growingPeriod: 105, profitPotential: 'high' },
  ],
  autumn: [
    { name: 'Rice', expectedYield: 3000, suitability: 'high', waterRequirement: 'high', growingPeriod: 110, profitPotential: 'high' },
    { name: 'Maize', expectedYield: 2400, suitability: 'medium', waterRequirement: 'medium', growingPeriod: 85, profitPotential: 'medium' },
  ],
};

export function CropSuggestions({ district, season, weather, language }: CropSuggestionsProps) {
  const seasonKey = season.toLowerCase();
  const suggestions = cropDatabase[seasonKey] || cropDatabase['whole year'];
  
  // Adjust suggestions based on weather
  const adjustedSuggestions = suggestions.map(crop => {
    let adjustedYield = crop.expectedYield;
    let adjustedSuitability = crop.suitability;
    
    if (weather) {
      // Adjust based on temperature
      if (weather.temperature > 35) {
        adjustedYield *= 0.9;
        if (crop.waterRequirement === 'high') adjustedSuitability = 'medium';
      } else if (weather.temperature < 15) {
        adjustedYield *= 0.85;
      }
      
      // Adjust based on humidity/rainfall
      if (weather.rainfall < 5 && crop.waterRequirement === 'high') {
        adjustedSuitability = 'low';
        adjustedYield *= 0.8;
      }
    }
    
    return { ...crop, expectedYield: Math.round(adjustedYield), suitability: adjustedSuitability };
  });

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'high': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLocalizedLevel = (level: string) => {
    switch (level) {
      case 'high': return t('high', language);
      case 'medium': return t('medium', language);
      case 'low': return t('low', language);
      default: return level;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sprout className="h-5 w-5 text-primary" />
          {t('suggestedCrops', language)}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {district} • {season}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {adjustedSuggestions.map((crop, index) => (
            <div 
              key={crop.name}
              className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">{crop.name}</h4>
                <Badge className={getSuitabilityColor(crop.suitability)}>
                  {getLocalizedLevel(crop.suitability)} {t('suitability', language)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-muted-foreground text-xs">{t('expectedYield', language)}</p>
                    <p className="font-medium">{crop.expectedYield} {t('kgPerHectare', language)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-muted-foreground text-xs">{t('waterRequirement', language)}</p>
                    <p className="font-medium">{getLocalizedLevel(crop.waterRequirement)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <div>
                    <p className="text-muted-foreground text-xs">{t('growingPeriod', language)}</p>
                    <p className="font-medium">{crop.growingPeriod} {t('days', language)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-muted-foreground text-xs">{t('profitPotential', language)}</p>
                    <p className="font-medium">{getLocalizedLevel(crop.profitPotential)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
