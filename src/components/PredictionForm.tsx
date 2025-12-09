import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { PredictionInput } from "@/lib/predictionService";

interface PredictionFormProps {
  language: Language;
  onSubmit: (data: PredictionInput) => void;
  isLoading: boolean;
}

const states = ['Karnataka'];

const districts = [
  'BANGALORE RURAL',
  'BANGALORE URBAN',
  'BELGAUM',
  'BELLARY',
  'BIDAR',
  'BIJAPUR',
  'CHAMARAJANAGAR',
  'CHIKMAGALUR',
  'CHITRADURGA',
  'DAKSHIN KANNAD',
  'DAVANGERE',
  'DHARWAD',
  'GADAG',
  'GULBARGA',
  'HASSAN',
  'HAVERI',
  'KODAGU',
  'KOLAR',
  'KOPPAL',
  'MANDYA',
  'MYSORE',
  'RAICHUR',
  'RAMANAGARA',
  'SHIMOGA',
  'TUMKUR',
  'UDUPI',
  'UTTAR KANNAD',
  'YADGIR',
];

// Crops from ML training dataset (India agricultural data)
const crops = [
  'Rice', 
  'Wheat', 
  'Maize', 
  'Sorghum',  // Same as Jowar
  'Groundnut',
  'Potatoes',
  'Soybeans',
  'Cassava',
  'Jowar',
  'Arhar/Tur',
  'Bajra'
];
const seasons = ['Kharif', 'Rabi', 'Whole Year', 'Autumn'];

export function PredictionForm({ language, onSubmit, isLoading }: PredictionFormProps) {
  const t = translations[language];
  const [formData, setFormData] = useState<PredictionInput>({
    state: '',
    district: '',
    crop: '',
    season: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.state && formData.district && formData.crop && formData.season) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="shadow-medium border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sprout className="h-5 w-5 text-primary" />
          {t.inputForm}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state" className="text-foreground">{t.stateName}</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
              <SelectTrigger id="state" className="bg-background border-border">
                <SelectValue placeholder={t.stateName} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px]">
                {states.map((state) => (
                  <SelectItem key={state} value={state} className="cursor-pointer">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="district" className="text-foreground">{t.districtName}</Label>
            <Select value={formData.district} onValueChange={(value) => setFormData({ ...formData, district: value })}>
              <SelectTrigger id="district" className="bg-background border-border">
                <SelectValue placeholder={t.districtName} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px]">
                {districts.map((district) => (
                  <SelectItem key={district} value={district} className="cursor-pointer">
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop" className="text-foreground">{t.currentCrop}</Label>
            <Select value={formData.crop} onValueChange={(value) => setFormData({ ...formData, crop: value })}>
              <SelectTrigger id="crop" className="bg-background border-border">
                <SelectValue placeholder={t.currentCrop} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {crops.map((crop) => (
                  <SelectItem key={crop} value={crop} className="cursor-pointer">
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season" className="text-foreground">{t.season}</Label>
            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
              <SelectTrigger id="season" className="bg-background border-border">
                <SelectValue placeholder={t.season} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {seasons.map((season) => (
                  <SelectItem key={season} value={season} className="cursor-pointer">
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-all"
            disabled={isLoading || !formData.state || !formData.district || !formData.crop || !formData.season}
          >
            {isLoading ? t.predicting : t.predict}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
