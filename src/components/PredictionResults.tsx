import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Brain, Activity, Cloud, Thermometer, Droplets } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface WeatherImpact {
  live_temperature?: number;
  live_humidity?: number;
  live_rainfall?: number;
  estimated_seasonal_rainfall?: number;
  temperature_in_optimal_range?: boolean;
  rainfall_adequacy?: string;
  using_seasonal_averages?: boolean;
}

interface ModelInfo {
  type: string;
  features: string[];
  training_data: string;
  factors?: {
    base_intercept: number;
    rainfall_contribution: number;
    pesticides_contribution: number;
    temperature_contribution: number;
    district_factor: number;
    effective_temperature?: number;
    effective_rainfall?: number;
    optimal_temp_range?: [number, number];
  };
  weather_impact?: WeatherImpact;
}

interface PredictionResultExtended {
  status: 'success' | 'error';
  current_yield: number;
  recommended_crop: string | null;
  estimated_gain: number | null;
  message: string;
  confidence?: number;
  model_info?: ModelInfo;
}

interface PredictionResultsProps {
  language: Language;
  result: PredictionResultExtended | null;
}

export function PredictionResults({ language, result }: PredictionResultsProps) {
  const t = translations[language];

  if (!result) return null;

  const confidence = result.confidence ?? 0.85;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="space-y-4">
      {/* Live Weather Badge */}
      {result.model_info?.weather_impact && !result.model_info.weather_impact.using_seasonal_averages && (
        <Card className="shadow-soft border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Cloud className="h-5 w-5 text-blue-500 animate-float" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Live Weather Data</p>
                  <p className="text-xs text-muted-foreground">Real-time conditions applied to prediction</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <Thermometer className="h-3 w-3" />
                  {result.model_info.weather_impact.live_temperature?.toFixed(1)}°C
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Droplets className="h-3 w-3" />
                  {result.model_info.weather_impact.live_humidity}%
                </Badge>
                {result.model_info.weather_impact.live_rainfall !== undefined && result.model_info.weather_impact.live_rainfall > 0 && (
                  <Badge variant="secondary" className="gap-1 bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    🌧️ {result.model_info.weather_impact.live_rainfall.toFixed(1)}mm
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ML Model Badge */}
      <Card className="shadow-medium border-0 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-primary" />
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary animate-pulse-soft" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">ML-Powered Prediction</p>
              <p className="text-xs text-muted-foreground">
                {result.model_info?.type || 'Multiple Linear Regression'} Model
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">{confidencePercent}% Confidence</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Yield Result */}
      <Card className="shadow-medium border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-hero" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            {t.results}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-5 bg-gradient-to-br from-secondary to-secondary/50 rounded-xl border border-border/50">
            <span className="font-medium text-secondary-foreground">{t.currentYield}:</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-gradient-hero">
                {result.current_yield?.toFixed(0) ?? '0'}
              </span>
              <span className="text-lg ml-1 text-muted-foreground">{t.units}</span>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Model Confidence</span>
              <span className="font-medium text-foreground">{confidencePercent}%</span>
            </div>
            <Progress value={confidencePercent} className="h-2" />
          </div>

          {/* Model Factors */}
          {result.model_info?.factors && (
            <div className="space-y-3 pt-2">
              {/* Weather Status Row */}
              {result.model_info.weather_impact && !result.model_info.weather_impact.using_seasonal_averages && (
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <span className="text-xs text-muted-foreground">Effective Temperature</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {result.model_info.factors.effective_temperature}°C
                    </span>
                    {result.model_info.weather_impact.temperature_in_optimal_range ? (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700 dark:text-green-300">
                        ✓ Optimal
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        ⚠ Outside optimal
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {result.model_info.weather_impact && !result.model_info.weather_impact.using_seasonal_averages && (
                <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <span className="text-xs text-muted-foreground">Est. Seasonal Rainfall</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {result.model_info.factors.effective_rainfall}mm
                    </span>
                    <Badge variant="secondary" className={`text-xs ${
                      result.model_info.weather_impact.rainfall_adequacy === 'Good' 
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}>
                      {result.model_info.weather_impact.rainfall_adequacy}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Rainfall Impact</p>
                  <p className="text-sm font-semibold text-foreground">
                    {result.model_info.factors.rainfall_contribution >= 0 ? '+' : ''}{result.model_info.factors.rainfall_contribution?.toLocaleString() || 0} hg/ha
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Temperature Effect</p>
                  <p className="text-sm font-semibold text-foreground">
                    {result.model_info.factors.temperature_contribution >= 0 ? '+' : ''}{result.model_info.factors.temperature_contribution?.toLocaleString() || 0} hg/ha
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">District Factor</p>
                  <p className="text-sm font-semibold text-foreground">
                    ×{result.model_info.factors.district_factor?.toFixed(2) || '1.00'}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Pesticides Effect</p>
                  <p className="text-sm font-semibold text-foreground">
                    +{result.model_info.factors.pesticides_contribution?.toLocaleString() || 0} hg/ha
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Recommendation */}
      <Card className="shadow-medium border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-accent" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Target className="h-5 w-5 text-accent" />
            </div>
            {t.optimization}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.recommended_crop ? (
            <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/20 rounded-full">
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed">
                    {t.recommendationPrefix}{' '}
                    <span className="font-bold text-accent text-lg">{result.recommended_crop}</span>
                    {' '}{t.recommendationSuffix}{' '}
                    <span className="font-bold text-accent text-lg">
                      +{result.estimated_gain ?? 0} {t.units}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on ML analysis of historical yield data, rainfall patterns, and soil conditions.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-muted/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  {t.noOptimization}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Data Info */}
      {result.model_info?.training_data && (
        <div className="text-center text-xs text-muted-foreground">
          <p>Model trained on: {result.model_info.training_data}</p>
        </div>
      )}
    </div>
  );
}
