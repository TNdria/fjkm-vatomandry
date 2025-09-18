import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddAdherentDialogProps {
  onAdherentAdded: () => void;
  groupes: any[];
}

export function AddAdherentDialog({ onAdherentAdded, groupes }: AddAdherentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>();
  const [selectedGroupes, setSelectedGroupes] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validation des champs obligatoires
      const nom = formData.get('nom') as string;
      const prenom = formData.get('prenom') as string;
      const sexe = formData.get('sexe') as string;
      
      if (!nom?.trim()) {
        toast({
          title: "Erreur de validation",
          description: "Le nom est obligatoire",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (!prenom?.trim()) {
        toast({
          title: "Erreur de validation", 
          description: "Le prénom est obligatoire",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (!sexe) {
        toast({
          title: "Erreur de validation",
          description: "Le sexe est obligatoire",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const adherentData = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        sexe: sexe as 'M' | 'F',
        date_naissance: dateNaissance?.toISOString().split('T')[0] || null,
        adresse: (formData.get('adresse') as string)?.trim() || null,
        quartier: (formData.get('quartier') as string)?.trim() || null,
        telephone: (formData.get('telephone') as string)?.trim() || null,
        email: (formData.get('email') as string)?.trim() || null,
        fonction_eglise: (formData.get('fonction_eglise') as string)?.trim() || null,
      };

      const { data: adherent, error: adherentError } = await supabase
        .from('adherents')
        .insert(adherentData)
        .select()
        .single();

      if (adherentError) throw adherentError;

      // Ajouter aux groupes sélectionnés
      if (selectedGroupes.length > 0) {
        const groupeAssociations = selectedGroupes.map(groupeId => ({
          id_adherent: adherent.id_adherent,
          id_groupe: groupeId
        }));

        const { error: groupeError } = await supabase
          .from('adherents_groupes')
          .insert(groupeAssociations);

        if (groupeError) throw groupeError;
      }

      toast({
        title: "Adhérent ajouté",
        description: `${adherentData.prenom} ${adherentData.nom} a été ajouté avec succès.`,
      });

      setOpen(false);
      onAdherentAdded();
      
      // Reset form
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
      setDateNaissance(undefined);
      setSelectedGroupes([]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de l'adhérent.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:shadow-glow transition-bounce">
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Adhérent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel adhérent</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l'adhérent. Les champs avec * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" name="nom" required className="transition-smooth" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" name="prenom" required className="transition-smooth" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexe">Sexe *</Label>
              <Select name="sexe" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateNaissance ? (
                      format(dateNaissance, "PPP", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateNaissance}
                    onSelect={setDateNaissance}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea id="adresse" name="adresse" className="transition-smooth" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quartier">Quartier</Label>
              <Input id="quartier" name="quartier" className="transition-smooth" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" name="telephone" type="tel" className="transition-smooth" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className="transition-smooth" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fonction_eglise">Fonction dans l'église</Label>
              <Input id="fonction_eglise" name="fonction_eglise" className="transition-smooth" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Groupes paroissiaux</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {groupes.map((groupe) => (
                <label key={groupe.id_groupe} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    value={groupe.id_groupe}
                    checked={selectedGroupes.includes(groupe.id_groupe)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroupes([...selectedGroupes, groupe.id_groupe]);
                      } else {
                        setSelectedGroupes(selectedGroupes.filter(id => id !== groupe.id_groupe));
                      }
                    }}
                    className="rounded"
                  />
                  <span>{groupe.nom_groupe}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary hover:shadow-glow">
              {loading ? 'Ajout en cours...' : 'Ajouter l\'adhérent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}