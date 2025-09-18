import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Contribution {
  id: string;
  adherent_id: string;
  type: 'dime' | 'offrande' | 'don';
  montant: number;
  date_contribution: string;
  adherent?: {
    nom: string;
    prenom: string;
  };
}

interface Adherent {
  id_adherent: string;
  nom: string;
  prenom: string;
}

interface ContributionsManagerProps {
  canManage: boolean;
}

export const ContributionsManager = ({ canManage }: ContributionsManagerProps) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    adherent_id: "",
    type: "",
    montant: "",
    date_contribution: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchContributions();
    fetchAdherents();
  }, []);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          adherents!fk_contributions_adherent(nom, prenom)
        `)
        .order('date_contribution', { ascending: false });

      if (error) throw error;

      setContributions(data?.map(item => ({
        ...item,
        type: item.type as 'dime' | 'offrande' | 'don',
        adherent: item.adherents
      })) || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des contributions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdherents = async () => {
    try {
      const { data, error } = await supabase
        .from('adherents')
        .select('id_adherent, nom, prenom')
        .order('nom');

      if (error) throw error;
      setAdherents(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des adhérents");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('contributions')
        .insert([{
          adherent_id: formData.adherent_id,
          type: formData.type,
          montant: parseFloat(formData.montant),
          date_contribution: formData.date_contribution
        }]);

      if (error) throw error;

      toast.success("Contribution ajoutée avec succès");
      setShowAddDialog(false);
      setFormData({
        adherent_id: "",
        type: "",
        montant: "",
        date_contribution: new Date().toISOString().split('T')[0]
      });
      fetchContributions();
    } catch (error: any) {
      toast.error("Erreur lors de l'ajout de la contribution");
      console.error(error);
    }
  };

  const deleteContribution = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette contribution ?")) return;

    try {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Contribution supprimée");
      fetchContributions();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dime': return 'bg-green-100 text-green-800';
      case 'offrande': return 'bg-blue-100 text-blue-800';
      case 'don': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'dime': return 'Dîme';
      case 'offrande': return 'Offrande';
      case 'don': return 'Don';
      default: return type;
    }
  };

  const filteredContributions = contributions.filter(contribution => {
    const matchesSearch = 
      contribution.adherent?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.adherent?.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || contribution.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des Contributions</CardTitle>
            <CardDescription>
              Suivi des dîmes, offrandes et dons des adhérents
            </CardDescription>
          </div>
          {canManage && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Contribution</DialogTitle>
                  <DialogDescription>
                    Enregistrer une nouvelle contribution financière
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adherent">Adhérent</Label>
                    <Select
                      value={formData.adherent_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, adherent_id: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un adhérent" />
                      </SelectTrigger>
                      <SelectContent>
                        {adherents.map((adherent) => (
                          <SelectItem key={adherent.id_adherent} value={adherent.id_adherent}>
                            {adherent.nom} {adherent.prenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type de contribution</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dime">Dîme</SelectItem>
                        <SelectItem value="offrande">Offrande</SelectItem>
                        <SelectItem value="don">Don</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montant">Montant (Ar)</Label>
                    <Input
                      id="montant"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.montant}
                      onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date de contribution</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date_contribution}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_contribution: e.target.value }))}
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">Ajouter</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un adhérent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="dime">Dîmes</SelectItem>
                <SelectItem value="offrande">Offrandes</SelectItem>
                <SelectItem value="don">Dons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adhérent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  {canManage && <TableHead className="w-24">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground">
                      Aucune contribution trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContributions.map((contribution) => (
                    <TableRow key={contribution.id}>
                      <TableCell className="font-medium">
                        {contribution.adherent?.nom} {contribution.adherent?.prenom}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(contribution.type)}>
                          {getTypeLabel(contribution.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{contribution.montant.toLocaleString()} Ar</TableCell>
                      <TableCell>
                        {format(new Date(contribution.date_contribution), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteContribution(contribution.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};