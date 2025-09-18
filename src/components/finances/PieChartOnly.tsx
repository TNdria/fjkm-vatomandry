import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PieData {
  name: string;
  value: number;
  color: string;
}

export const PieChartOnly = () => {
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      
      // Données pour le camembert (année actuelle)
      const { data: pieDataRaw, error: pieError } = await supabase
        .from('contributions')
        .select('type, montant')
        .gte('date_contribution', `${currentYear}-01-01`);

      if (pieError) throw pieError;

      const pieStats = { dimes: 0, offrandes: 0, dons: 0 };
      pieDataRaw?.forEach(item => {
        pieStats[item.type as keyof typeof pieStats] += item.montant;
      });

      const pieArray: PieData[] = [
        { name: 'Dîmes', value: pieStats.dimes, color: '#10B981' },
        { name: 'Offrandes', value: pieStats.offrandes, color: '#3B82F6' },
        { name: 'Dons', value: pieStats.dons, color: '#8B5CF6' }
      ].filter(item => item.value > 0);

      setPieData(pieArray);

    } catch (error: any) {
      toast.error("Erreur lors du chargement du graphique");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Répartition par Type</CardTitle>
        <CardDescription>Distribution des contributions (année en cours)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            dimes: { label: "Dîmes", color: "#10B981" },
            offrandes: { label: "Offrandes", color: "#3B82F6" },
            dons: { label: "Dons", color: "#8B5CF6" }
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                formatter={(value: number) => [`${value.toLocaleString()} Ar`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};