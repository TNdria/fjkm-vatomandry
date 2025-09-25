import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdidyRecord {
  id: string;
  adherent_id: string;
  mois: number;
  annee: number;
  montant: number;
  paye: boolean;
  date_paiement: string | null;
  adherents: {
    nom: string;
    prenom: string;
  };
}

interface AdidyStats {
  totalMpandray: number;
  paiements: number;
  montantTotal: number;
  tauxPaiement: number;
}

export function AdidyManager() {
  const [records, setRecords] = useState<AdidyRecord[]>([]);
  const [stats, setStats] = useState<AdidyStats>({
    totalMpandray: 0,
    paiements: 0,
    montantTotal: 0,
    tauxPaiement: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [minAmount, setMinAmount] = useState(0);
  const { toast } = useToast();

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  useEffect(() => {
    fetchAdidyData();
  }, [selectedMonth, selectedYear]);

  const filteredRecords = records.filter(record => {
    if (showUnpaidOnly && record.paye) return false;
    if (minAmount > 0 && record.montant < minAmount) return false;
    return true;
  });

  const fetchAdidyData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('adidy')
        .select(`
          *,
          adherents (nom, prenom)
        `)
        .eq('mois', selectedMonth)
        .eq('annee', selectedYear)
        .order('adherents(nom)');

      if (error) throw error;

      setRecords(data || []);
      
      // Calculer les statistiques
      const totalRecords = data?.length || 0;
      const paidRecords = data?.filter(r => r.paye).length || 0;
      const totalAmount = data?.filter(r => r.paye).reduce((sum, r) => sum + Number(r.montant), 0) || 0;
      
      setStats({
        totalMpandray: totalRecords,
        paiements: paidRecords,
        montantTotal: totalAmount,
        tauxPaiement: totalRecords > 0 ? (paidRecords / totalRecords) * 100 : 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données Adidy:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données Adidy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentToggle = async (recordId: string, isPaid: boolean) => {
    try {
      const { error } = await supabase
        .from('adidy')
        .update({
          paye: isPaid,
          date_paiement: isPaid ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Paiement ${isPaid ? 'enregistré' : 'annulé'}`,
      });

      fetchAdidyData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paiement",
        variant: "destructive",
      });
    }
  };

  const handleMontantChange = async (recordId: string, newMontant: number) => {
    try {
      const { error } = await supabase
        .from('adidy')
        .update({ montant: newMontant })
        .eq('id', recordId);

      if (error) throw error;

      fetchAdidyData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du montant:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le montant",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestion des Adidy</h2>
        <p className="text-muted-foreground">
          Suivi mensuel des cotisations des Mpandray
        </p>
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardHeader>
          <CardTitle>Période</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="month">Mois</Label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="block w-full mt-1 border border-input bg-background px-3 py-2 rounded-md"
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-32"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unpaidOnly"
                checked={showUnpaidOnly}
                onCheckedChange={(checked) => setShowUnpaidOnly(checked as boolean)}
              />
              <Label htmlFor="unpaidOnly">Afficher uniquement les non-payés</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="minAmount">Montant minimum :</Label>
              <Input
                id="minAmount"
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                placeholder="500"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">Ar</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mpandray</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMpandray}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paiements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.montantTotal.toLocaleString()} Ar</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Paiement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tauxPaiement.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi des paiements - {months[selectedMonth - 1]} {selectedYear}</CardTitle>
          <CardDescription>
            Cochez pour marquer comme payé, modifiez le montant si nécessaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={record.paye}
                    onCheckedChange={(checked) =>
                      handlePaymentToggle(record.id, checked as boolean)
                    }
                  />
                  <div>
                    <p className="font-medium">
                      {record.adherents.nom} {record.adherents.prenom}
                    </p>
                    {record.date_paiement && (
                      <p className="text-sm text-muted-foreground">
                        Payé le {new Date(record.date_paiement).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    value={record.montant}
                    onChange={(e) => handleMontantChange(record.id, Number(e.target.value))}
                    className="w-32"
                    placeholder="Montant"
                  />
                  <span className="text-sm text-muted-foreground">Ar</span>
                  <Badge variant={record.paye ? "default" : "secondary"}>
                    {record.paye ? "Payé" : "En attente"}
                  </Badge>
                </div>
              </div>
            ))}
            {filteredRecords.length === 0 && records.length > 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun résultat ne correspond aux filtres sélectionnés
              </p>
            )}
            {records.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun Mpandray trouvé pour cette période
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}