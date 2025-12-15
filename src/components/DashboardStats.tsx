import { Card, CardContent } from "@/components/ui/card";
import { Warehouse, BarChart3, TrendingUp, Sprout } from "lucide-react";
import { Language, t } from "@/lib/translations";

interface DashboardStatsProps {
  totalFarms: number;
  totalPredictions: number;
  avgYield: number;
  bestCrop: string;
  language: Language;
}

export function DashboardStats({ 
  totalFarms, 
  totalPredictions, 
  avgYield, 
  bestCrop,
  language 
}: DashboardStatsProps) {
  const stats = [
    {
      icon: Warehouse,
      label: t('totalFarms', language),
      value: totalFarms.toString(),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: BarChart3,
      label: t('totalPredictions', language),
      value: totalPredictions.toString(),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: TrendingUp,
      label: t('avgYield', language),
      value: avgYield > 0 ? `${avgYield.toFixed(0)} ${t('kgPerHectare', language)}` : '-',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Sprout,
      label: t('bestCrop', language),
      value: bestCrop || '-',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                <p className="text-lg font-semibold text-foreground truncate">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
