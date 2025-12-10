import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Cloud, MapPin, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WeatherCard } from "@/components/WeatherCard";
import { Language } from "@/lib/translations";

const KARNATAKA_DISTRICTS = [
  'BANGALORE RURAL', 'BANGALORE URBAN', 'BELGAUM', 'BELLARY', 'BIDAR',
  'BIJAPUR', 'CHAMARAJANAGAR', 'CHIKMAGALUR', 'CHITRADURGA', 'DAKSHIN KANNAD',
  'DAVANGERE', 'DHARWAD', 'GADAG', 'GULBARGA', 'HASSAN', 'HAVERI', 'KODAGU',
  'KOLAR', 'KOPPAL', 'MANDYA', 'MYSORE', 'RAICHUR', 'RAMANAGARA', 'SHIMOGA',
  'TUMKUR', 'UDUPI', 'UTTAR KANNAD', 'YADGIR'
];

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
  icon?: string;
  location?: string;
  wind_speed?: number;
}

interface WeatherLookupProps {
  language: Language;
  onWeatherFetched?: (weather: WeatherData, district: string) => void;
}

export function WeatherLookup({ language, onWeatherFetched }: WeatherLookupProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('MYSORE');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = async (district: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { district, state: 'Karnataka' }
      });

      if (error) throw error;
      setWeather(data);
      onWeatherFetched?.(data, district);
    } catch (error) {
      console.error('Weather fetch error:', error);
      const fallbackWeather = {
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        description: "Weather data unavailable",
        location: district
      };
      setWeather(fallbackWeather);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDistrict);
  }, []);

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    fetchWeather(district);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medium border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-hero" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            Select District
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
              <SelectTrigger className="flex-1 bg-background border-border">
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px]">
                {KARNATAKA_DISTRICTS.map((district) => (
                  <SelectItem key={district} value={district} className="cursor-pointer">
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fetchWeather(selectedDistrict)}
              disabled={isLoading}
              className="border-border hover:bg-primary/10"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time weather data from OpenWeatherMap for all 28 Karnataka districts
          </p>
        </CardContent>
      </Card>

      {weather && (
        <div className="animate-fade-in">
          <WeatherCard weather={weather} language={language} />
        </div>
      )}

      {isLoading && !weather && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
