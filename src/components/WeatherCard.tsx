import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Thermometer, Wind } from "lucide-react";
import { Language } from "@/lib/translations";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
  icon?: string;
  location?: string;
  wind_speed?: number;
}

interface WeatherCardProps {
  weather: WeatherData;
  language: Language;
}

export function WeatherCard({ weather, language }: WeatherCardProps) {
  return (
    <Card className="shadow-medium border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground text-lg">
          <Cloud className="h-5 w-5 text-primary" />
          Current Weather
          {weather.location && (
            <span className="text-sm font-normal text-muted-foreground">
              - {weather.location}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Thermometer className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {weather.temperature}°C
              </p>
              <p className="text-xs text-muted-foreground">Temperature</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Droplets className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {weather.humidity}%
              </p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Cloud className="h-8 w-8 text-gray-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {weather.rainfall} mm
              </p>
              <p className="text-xs text-muted-foreground">Rainfall</p>
            </div>
          </div>
          
          {weather.wind_speed !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Wind className="h-8 w-8 text-teal-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {weather.wind_speed} m/s
                </p>
                <p className="text-xs text-muted-foreground">Wind</p>
              </div>
            </div>
          )}
        </div>
        
        <p className="mt-4 text-center text-sm text-muted-foreground capitalize">
          {weather.description}
        </p>
      </CardContent>
    </Card>
  );
}
