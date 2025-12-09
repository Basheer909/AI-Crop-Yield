import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogOut, History, Cloud, Tractor, TrendingUp, Plus, Sprout } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-soft" />
          <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-50" />
      <div className="fixed inset-0 bg-background/60" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-10 text-center space-y-4 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-soft" />
                <div className="relative p-3 bg-gradient-primary rounded-2xl shadow-glow">
                  <Sprout className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-hero">
              {t.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage} 
            />
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-soft">
                <span className="text-sm text-muted-foreground">Welcome, </span>
                <span className="text-sm font-medium text-foreground">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            </div>
          </div>

          <Separator className="mb-8 bg-border/50" />

          {/* Main Content with Tabs */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Tabs defaultValue="predict" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto p-1.5 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-soft">
                <TabsTrigger 
                  value="predict" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Predict</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="farms" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
                >
                  <Tractor className="h-4 w-4" />
                  <span className="hidden sm:inline">Farms</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="weather" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
                >
                  <Cloud className="h-4 w-4" />
                  <span className="hidden sm:inline">Weather</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="predict" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="hover-lift">
                      <PredictionForm 
                        language={language}
                        onSubmit={handlePrediction}
                        isLoading={isLoading}
                      />
                    </div>
                    {weather && (
                      <div className="hover-lift">
                        <WeatherCard weather={weather} language={language} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    {result && (
                      <div className="hover-lift">
                        <PredictionResults 
                          language={language}
                          result={result}
                        />
                      </div>
                    )}
                    {result && (
                      <Button 
                        onClick={() => setShowOptimization(true)}
                        className="w-full h-12 bg-gradient-accent hover:opacity-90 text-accent-foreground font-semibold rounded-xl shadow-accent-glow hover:shadow-strong transition-all"
                        variant="outline"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Get AI Optimization Tips
                      </Button>
                    )}
                    {showOptimization && result && (
                      <div className="hover-lift">
                        <OptimizationCard 
                          result={result}
                          weather={weather}
                          formData={selectedFarm || { state: 'Karnataka', district: 'MYSORE' }}
                        />
                      </div>
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
                  <Card className="shadow-medium border-0 bg-card/95 backdrop-blur-sm overflow-hidden hover-lift">
                    <div className="h-1 bg-gradient-hero" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Cloud className="h-5 w-5 text-primary" />
                        </div>
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
      </div>
    </div>
  );
};

export default Dashboard;