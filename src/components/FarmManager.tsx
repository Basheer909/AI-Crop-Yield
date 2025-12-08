import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tractor, Plus, Trash2, Edit, MapPin } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface Farm {
  id: string;
  name: string;
  state_name: string;
  district_name: string;
  area_hectares: number | null;
  soil_type: string | null;
  irrigation_type: string | null;
}

interface FarmManagerProps {
  userId: string;
  onSelectFarm: (farm: Farm | null) => void;
  language: Language;
}

const states = ['Andhra Pradesh', 'West Bengal', 'Karnataka'];

const districts = [
  'ANANTAPUR', 'PURULIA', 'BANGALORE RURAL', 'BANGALORE URBAN', 'BELGAUM',
  'BELLARY', 'BIDAR', 'BIJAPUR', 'CHAMARAJANAGAR', 'CHIKMAGALUR', 'CHITRADURGA',
  'DAKSHIN KANNAD', 'DAVANGERE', 'DHARWAD', 'GADAG', 'GULBARGA', 'HASSAN',
  'HAVERI', 'KODAGU', 'KOLAR', 'KOPPAL', 'MANDYA', 'MYSORE', 'RAICHUR',
  'RAMANAGARA', 'SHIMOGA', 'TUMKUR', 'UDUPI', 'UTTAR KANNAD', 'YADGIR',
];

const soilTypes = ['Alluvial', 'Black Cotton', 'Red', 'Laterite', 'Sandy', 'Clay'];
const irrigationTypes = ['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler', 'Mixed'];

export function FarmManager({ userId, onSelectFarm, language }: FarmManagerProps) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    state_name: '',
    district_name: '',
    area_hectares: '',
    soil_type: '',
    irrigation_type: '',
  });
  const { toast } = useToast();
  const t = translations[language];

  useEffect(() => {
    fetchFarms();
  }, [userId]);

  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load farms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const farmData = {
        user_id: userId,
        name: formData.name,
        state_name: formData.state_name,
        district_name: formData.district_name,
        area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : null,
        soil_type: formData.soil_type || null,
        irrigation_type: formData.irrigation_type || null,
      };

      if (editingFarm) {
        const { error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', editingFarm.id);

        if (error) throw error;
        toast({ title: "Success", description: "Farm updated successfully" });
      } else {
        const { error } = await supabase
          .from('farms')
          .insert(farmData);

        if (error) throw error;
        toast({ title: "Success", description: "Farm added successfully" });
      }

      setIsDialogOpen(false);
      setEditingFarm(null);
      resetForm();
      fetchFarms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save farm",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (farmId: string) => {
    if (!confirm("Are you sure you want to delete this farm?")) return;

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;
      toast({ title: "Success", description: "Farm deleted" });
      fetchFarms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete farm",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      state_name: farm.state_name,
      district_name: farm.district_name,
      area_hectares: farm.area_hectares?.toString() || '',
      soil_type: farm.soil_type || '',
      irrigation_type: farm.irrigation_type || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      state_name: '',
      district_name: '',
      area_hectares: '',
      soil_type: '',
      irrigation_type: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Tractor className="h-6 w-6 text-primary" />
          My Farms
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingFarm(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Farm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFarm ? 'Edit Farm' : 'Add New Farm'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Farm Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Farm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select 
                    value={formData.state_name} 
                    onValueChange={(value) => setFormData({ ...formData, state_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>District *</Label>
                  <Select 
                    value={formData.district_name} 
                    onValueChange={(value) => setFormData({ ...formData, district_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Area (Hectares)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.area_hectares}
                  onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                  placeholder="e.g., 5.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Soil Type</Label>
                  <Select 
                    value={formData.soil_type} 
                    onValueChange={(value) => setFormData({ ...formData, soil_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {soilTypes.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Irrigation</Label>
                  <Select 
                    value={formData.irrigation_type} 
                    onValueChange={(value) => setFormData({ ...formData, irrigation_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {irrigationTypes.map(i => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingFarm ? 'Update Farm' : 'Add Farm'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {farms.length === 0 ? (
        <Card className="shadow-medium border-border bg-card">
          <CardContent className="py-12 text-center">
            <Tractor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No farms added yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add Farm" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((farm) => (
            <Card 
              key={farm.id} 
              className="shadow-medium border-border bg-card hover:border-primary transition-colors cursor-pointer"
              onClick={() => onSelectFarm(farm)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{farm.name}</span>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleEdit(farm); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDelete(farm.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {farm.district_name}, {farm.state_name}
                  </div>
                  {farm.area_hectares && (
                    <p className="text-muted-foreground">
                      Area: {farm.area_hectares} hectares
                    </p>
                  )}
                  {farm.soil_type && (
                    <p className="text-muted-foreground">
                      Soil: {farm.soil_type}
                    </p>
                  )}
                  {farm.irrigation_type && (
                    <p className="text-muted-foreground">
                      Irrigation: {farm.irrigation_type}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
