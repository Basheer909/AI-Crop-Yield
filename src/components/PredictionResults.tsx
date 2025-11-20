import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { PredictionResult } from "@/lib/predictionService";

interface PredictionResultsProps {
  language: Language;
  result: PredictionResult | null;
}

export function PredictionResults({ language, result }: PredictionResultsProps) {
  const t = translations[language];

  if (!result) return null;

  return (
    <div className="space-y-4">
      <Card className="shadow-medium border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t.results}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
              <span className="font-medium text-secondary-foreground">{t.currentYield}:</span>
              <span className="text-2xl font-bold text-primary">
                {result.current_yield.toFixed(2)} {t.units}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Target className="h-5 w-5 text-accent" />
            {t.optimization}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.recommended_crop ? (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-foreground">
                {t.recommendationPrefix} <strong className="text-accent">{result.recommended_crop}</strong> {t.recommendationSuffix} <strong className="text-accent">+{result.estimated_gain} {t.units}</strong>
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground p-4 bg-muted rounded-lg">
              {t.noOptimization}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
