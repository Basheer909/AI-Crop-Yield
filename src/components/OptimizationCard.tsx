import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OptimizationCardProps {
  result: {
    current_yield: number;
    recommended_crop: string | null;
  };
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
  } | null;
  formData: {
    state?: string;
    district?: string;
    crop?: string;
    season?: string;
  };
}

export function OptimizationCard({ result, weather, formData }: OptimizationCardProps) {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchOptimization = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize', {
        body: {
          state: formData.state || 'Karnataka',
          district: formData.district || 'MYSORE',
          season: formData.season || 'Kharif',
          weather,
          currentYield: result.current_yield,
          currentCrop: formData.crop || 'Rice',
        }
      });

      if (error) throw error;
      
      if (data.status === 'success') {
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch optimization tips",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-medium border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Optimization Tips
          </div>
          {recommendations && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={fetchOptimization}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recommendations && !isLoading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Get AI-powered recommendations to maximize your crop yield.
            </p>
            <Button onClick={fetchOptimization} className="bg-primary hover:bg-primary/90">
              <Lightbulb className="h-4 w-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Analyzing your farm data...</span>
          </div>
        )}

        {recommendations && !isLoading && (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {recommendations}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
