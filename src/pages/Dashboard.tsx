import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogOut, History, Cloud, Tractor, TrendingUp, Plus } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PredictionForm } from "@/components/PredictionForm";
import { PredictionResults } from "@/components/PredictionResults";
import { WeatherCard } from "@/components/WeatherCard";
import { FarmManager } from "@/components/FarmManager";
import { OptimizationCard } from "@/components/OptimizationCard";
import { PredictionHistory } from "@/components/PredictionHistory";
import { translations, Language } from "@/lib/translations";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
  icon?: string;
  location?: string;
}

interface PredictionResultLocal {
  status: 'success' | 'error';
  current_yield: number;
  recommended_crop: string | null;
  estimated_gain: number | null;
  message: string;
  confidence?: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResultLocal | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [showOptimization, setShowOptimization] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchWeather = async (district: string, state: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { district, state }
      });

      if (error) throw error;
      setWeather(data);
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      toast({
        title: "Weather Update",
        description: "Using default weather data",
        variant: "default",
      });
      setWeather({
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        description: "Weather data unavailable"
      });
    }
  };

  const handlePrediction = async (inputData: any) => {
    setIsLoading(true);
    try {
      // Fetch weather first
      await fetchWeather(inputData.district, inputData.state);

      // Call prediction function
      const { data, error } = await supabase.functions.invoke('predict', {
        body: { ...inputData, weather }
      });

      if (error) throw error;
      setResult(data);

      // Save to prediction logs
      if (user) {
        const { error: logError } = await supabase
          .from('prediction_logs')
          .insert([{
            user_id: user.id,
            farm_id: selectedFarm?.id || null,
            crop: inputData.crop,
            season: inputData.season,
            crop_year: new Date().getFullYear(),
            predicted_yield: data.current_yield,
            recommended_crop: data.recommended_crop,
            estimated_gain: data.estimated_gain,
            weather_data: weather ? JSON.parse(JSON.stringify(weather)) : null,
          }]);

        if (logError) {
          console.error('Failed to save prediction log:', logError);
        }
      }

      toast({
        title: t.success,
        description: data.message,
      });
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message || 'Prediction failed',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={setLanguage} 
          />
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Welcome,</span> {user.email}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="border-border hover:bg-secondary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.logout}
            </Button>
          </div>
        </div>

        <Separator className="mb-8 bg-border" />

        {/* Main Content with Tabs */}
        <Tabs defaultValue="predict" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="predict" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Predict
            </TabsTrigger>
            <TabsTrigger value="farms" className="flex items-center gap-2">
              <Tractor className="h-4 w-4" />
              Farms
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <PredictionForm 
                  language={language}
                  onSubmit={handlePrediction}
                  isLoading={isLoading}
                />
                {weather && <WeatherCard weather={weather} language={language} />}
              </div>
              <div className="space-y-6">
                <PredictionResults 
                  language={language}
                  result={result}
                />
                {result && (
                  <Button 
                    onClick={() => setShowOptimization(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Get AI Optimization Tips
                  </Button>
                )}
                {showOptimization && result && (
                  <OptimizationCard 
                    result={result}
                    weather={weather}
                    formData={selectedFarm || { state: 'Karnataka', district: 'MYSORE' }}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="farms">
            <FarmManager 
              userId={user.id} 
              onSelectFarm={setSelectedFarm}
              language={language}
            />
          </TabsContent>

          <TabsContent value="weather">
            <div className="max-w-md mx-auto">
              <Card className="shadow-medium border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-primary" />
                    Weather Lookup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Weather data is automatically fetched when you make a prediction. 
                    Select a district in the prediction form to see current conditions.
                  </p>
                  {weather && <WeatherCard weather={weather} language={language} />}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <PredictionHistory userId={user.id} language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
