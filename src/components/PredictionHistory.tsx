import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, TrendingUp, Calendar } from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { format } from "date-fns";

interface PredictionLog {
  id: string;
  crop: string;
  season: string;
  crop_year: number;
  predicted_yield: number;
  recommended_crop: string | null;
  estimated_gain: number | null;
  created_at: string;
  farm_id: string | null;
}

interface PredictionHistoryProps {
  userId: string;
  language: Language;
}

export function PredictionHistory({ userId, language }: PredictionHistoryProps) {
  const [history, setHistory] = useState<PredictionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('prediction_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="shadow-medium border-border bg-card">
        <CardContent className="py-12 text-center">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t.noHistory}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Make your first prediction to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <History className="h-6 w-6 text-primary" />
        {t.history}
      </h2>

      <div className="grid gap-4">
        {history.map((item) => (
          <Card 
            key={item.id} 
            className="shadow-medium border-border bg-card hover:border-primary/50 transition-colors"
          >
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-lg">
                      {item.crop}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      • {item.season} {item.crop_year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(item.created_at), 'PPp')}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Predicted Yield</p>
                    <p className="text-xl font-bold text-primary flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {item.predicted_yield.toFixed(2)} {t.units}
                    </p>
                  </div>

                  {item.recommended_crop && (
                    <div className="text-right border-l border-border pl-6">
                      <p className="text-sm text-muted-foreground">Better Alternative</p>
                      <p className="font-semibold text-accent">
                        {item.recommended_crop}
                      </p>
                      {item.estimated_gain && (
                        <p className="text-sm text-green-500">
                          +{item.estimated_gain} {t.units}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
