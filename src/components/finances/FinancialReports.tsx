import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const FinancialReports = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'trimester' | 'year'>('month');
  const { toast } = useToast();

  const generatePDFReport = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'trimester':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch financial data
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select(`
          montant,
          type,
          date_contribution,
          adherents!inner(nom, prenom)
        `)
        .gte('date_contribution', startDate.toISOString().split('T')[0])
        .lte('date_contribution', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      // Calculate totals by type
      const totals = {
        dimes: 0,
        offrandes: 0,
        dons: 0,
        total: 0
      };

      contributions?.forEach((c: any) => {
        const amount = Number(c.montant);
        totals.total += amount;
        
        switch (c.type.toLowerCase()) {
          case 'dîme':
          case 'dime':
            totals.dimes += amount;
            break;
          case 'offrande':
            totals.offrandes += amount;
            break;
          case 'don':
            totals.dons += amount;
            break;
        }
      });

      // Generate PDF
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('FJKM - Rapport Financier', 105, 20, { align: 'center' });
      
      // Period info
      pdf.setFontSize(12);
      const periodText = `Période: ${format(startDate, 'dd MMMM yyyy', { locale: fr })} - ${format(endDate, 'dd MMMM yyyy', { locale: fr })}`;
      pdf.text(periodText, 105, 35, { align: 'center' });
      
      // Summary section
      pdf.setFontSize(14);
      pdf.text('Résumé Financier', 20, 55);
      
      pdf.setFontSize(11);
      let yPos = 70;
      
      // Total contributions
      pdf.text(`Total des contributions: ${formatCurrency(totals.total)}`, 30, yPos);
      yPos += 10;
      
      // Breakdown by type
      pdf.text('Répartition par type:', 30, yPos);
      yPos += 8;
      pdf.text(`- Dîmes: ${formatCurrency(totals.dimes)}`, 40, yPos);
      yPos += 8;
      pdf.text(`- Offrandes: ${formatCurrency(totals.offrandes)}`, 40, yPos);
      yPos += 8;
      pdf.text(`- Dons: ${formatCurrency(totals.dons)}`, 40, yPos);
      yPos += 15;
      
      // Statistics
      pdf.text(`Nombre total de contributions: ${contributions?.length || 0}`, 30, yPos);
      yPos += 8;
      const avgContribution = totals.total / (contributions?.length || 1);
      pdf.text(`Contribution moyenne: ${formatCurrency(avgContribution)}`, 30, yPos);
      
      // Footer
      pdf.setFontSize(10);
      pdf.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 105, 280, { align: 'center' });
      
      // Save PDF
      pdf.save(`rapport_financier_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Rapport généré",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le rapport PDF.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateExcelReport = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'trimester':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch data
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select(`
          montant,
          type,
          date_contribution,
          adherents!inner(nom, prenom)
        `)
        .gte('date_contribution', startDate.toISOString().split('T')[0])
        .lte('date_contribution', endDate.toISOString().split('T')[0])
        .order('date_contribution', { ascending: false });

      if (error) throw error;

      // Create CSV content
      let csvContent = "Date,Nom,Prénom,Type,Montant (XAF)\n";
      
      contributions?.forEach((c: any) => {
        const date = format(new Date(c.date_contribution), 'dd/MM/yyyy');
        csvContent += `${date},"${c.adherents.nom}","${c.adherents.prenom}","${c.type}",${c.montant}\n`;
      });
      
      // Add summary at the end
      csvContent += "\n\nRésumé\n";
      
      // Calculate totals
      const totals = {
        dimes: 0,
        offrandes: 0,
        dons: 0,
        total: 0
      };

      contributions?.forEach((c: any) => {
        const amount = Number(c.montant);
        totals.total += amount;
        
        switch (c.type.toLowerCase()) {
          case 'dîme':
          case 'dime':
            totals.dimes += amount;
            break;
          case 'offrande':
            totals.offrandes += amount;
            break;
          case 'don':
            totals.dons += amount;
            break;
        }
      });
      
      csvContent += `Total Dîmes,${totals.dimes}\n`;
      csvContent += `Total Offrandes,${totals.offrandes}\n`;
      csvContent += `Total Dons,${totals.dons}\n`;
      csvContent += `Total Général,${totals.total}\n`;
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport_financier_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export réussi",
        description: "Le fichier Excel a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le fichier Excel.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount).replace('MGA', 'Ar');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Rapports Financiers
        </CardTitle>
        <CardDescription>
          Générez des rapports détaillés pour le comité d'église
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selection */}
        <div>
          <p className="text-sm font-medium mb-3">Sélectionner la période</p>
          <div className="flex gap-2">
            <Badge 
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedPeriod('month')}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Mensuel
            </Badge>
            <Badge 
              variant={selectedPeriod === 'trimester' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedPeriod('trimester')}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Trimestriel
            </Badge>
            <Badge 
              variant={selectedPeriod === 'year' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedPeriod('year')}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Annuel
            </Badge>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Rapport PDF</h4>
                <p className="text-sm text-muted-foreground">
                  Document formaté pour présentation au comité
                </p>
              </div>
              <Button 
                onClick={generatePDFReport} 
                disabled={loading}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Générer PDF
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Export Excel</h4>
                <p className="text-sm text-muted-foreground">
                  Données détaillées pour analyse approfondie
                </p>
              </div>
              <Button 
                onClick={generateExcelReport} 
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};