import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, PlusCircle, TrendingUp, Download } from "lucide-react";
import { ContributionsManager } from "@/components/finances/ContributionsManager";
import { FinancialStats } from "@/components/finances/FinancialStats";
import { FinancialCharts } from "@/components/finances/FinancialCharts";
import { TopContributors } from "@/components/finances/TopContributors";
import { PieChartOnly } from "@/components/finances/PieChartOnly";
import { FinancialReports } from "@/components/finances/FinancialReports";
import { CardGenerator } from "@/components/finances/CardGenerator";
import { useAuth } from "@/hooks/useAuth";

const Finances = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Vérifier les permissions d'accès aux finances
  const canManageFinances = hasRole('ADMIN') || hasRole('TRESORIER');
  const canViewFinances = canManageFinances || hasRole('RESPONSABLE');

  if (!canViewFinances) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions nécessaires pour accéder à la gestion financière.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Finances</h1>
        <p className="text-muted-foreground">
          Gestion et suivi des contributions financières
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
            <span className="sm:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger value="contributions" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Contributions</span>
            <span className="sm:hidden">Contrib.</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Calculator className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Statistiques</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Download className="h-3 w-3 md:h-4 md:w-4" />
            Rapports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <FinancialStats />
          <FinancialCharts />
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <TopContributors />
            <PieChartOnly />
          </div>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-6">
          <ContributionsManager canManage={canManageFinances} />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <FinancialCharts detailed />
          <TopContributors />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReports />
          <CardGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finances;