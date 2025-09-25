import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Adherent {
  id_adherent: string;
  nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  adresse: string;
  quartier: string;
  telephone: string;
  email: string;
  fonction_eglise: string;
  etat_civil: string | null;
  mpandray: boolean;
  faritra: string | null;
  sampana_id: string | null;
}


interface EditAdherentDialogProps {
  adherent: Adherent | null;
  open: boolean;
  onClose: () => void;
  onAdherentUpdated: () => void;
  groupes: any[];
}

export function EditAdherentDialog({ adherent, open, onClose, onAdherentUpdated, groupes }: EditAdherentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>();
  const [selectedGroupes, setSelectedGroupes] = useState<string[]>([]);
  const [mpandray, setMpandray] = useState(false);
  const [selectedFaritra, setSelectedFaritra] = useState<string>('');
  const { toast } = useToast();

  const quartiersParFaritra = {
    voalohany: ['Ambilakely', 'Lanijadona', 'Antantsaripaty', 'Antanambahiny'],
    faharoa: ['Marofototra', 'Centre-Ville', 'Bemasoandro', 'Ampasimandrevo'],
    fahatelo: ['Mangarivotra', 'Tanambao', 'Bazar'],
    fahefatra: ['Ampandranety', 'Bazar', 'Ampasimazava'],
    fahadimy: ['Vohitsara', 'Saint-Augustin']
  };

  useEffect(() => {
    if (adherent && open) {
      setDateNaissance(adherent.date_naissance ? new Date(adherent.date_naissance) : undefined);
      setMpandray(adherent.mpandray || false);
      setSelectedFaritra(adherent.faritra || '');
      fetchAdherentGroupes();
    }
  }, [adherent, open]);

  const fetchAdherentGroupes = async () => {
    if (!adherent) return;

    try {
      const { data, error } = await supabase
        .from('adherents_groupes')
        .select('id_groupe')
        .eq('id_adherent', adherent.id_adherent);

      if (error) throw error;

      setSelectedGroupes(data?.map(ag => ag.id_groupe) || []);
    } catch (error: any) {
      console.error('Error fetching adherent groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adherent) return;

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const adherentData = {
        nom: formData.get('nom') as string,
        prenom: formData.get('prenom') as string,
        sexe: formData.get('sexe') as 'M' | 'F',
        date_naissance: dateNaissance?.toISOString().split('T')[0] || null,
        adresse: formData.get('adresse') as string || null,
        quartier: formData.get('quartier') as string || null,
        telephone: formData.get('telephone') as string || null,
        email: formData.get('email') as string || null,
        fonction_eglise: formData.get('fonction_eglise') as string || null,
        etat_civil: (formData.get('etat_civil') as string) || null,
        mpandray: mpandray,
        faritra: (formData.get('faritra') as string) || null,
      } as any;

      // Update adherent
      const { error: adherentError } = await supabase
        .from('adherents')
        .update(adherentData)
        .eq('id_adherent', adherent.id_adherent);

      if (adherentError) throw adherentError;

      // Update group associations
      // First, delete existing associations
      await supabase
        .from('adherents_groupes')
        .delete()
        .eq('id_adherent', adherent.id_adherent);

      // Then, insert new associations
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
        title: "Adhérent modifié",
        description: `${adherentData.prenom} ${adherentData.nom} a été modifié avec succès.`,
      });

      onClose();
      onAdherentUpdated();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!adherent) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'adhérent</DialogTitle>
          <DialogDescription>
            Modifiez les informations de {adherent.prenom} {adherent.nom}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input 
                id="nom" 
                name="nom" 
                defaultValue={adherent.nom}
                required 
                className="transition-smooth" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input 
                id="prenom" 
                name="prenom" 
                defaultValue={adherent.prenom}
                required 
                className="transition-smooth" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexe">Sexe *</Label>
              <Select name="sexe" defaultValue={adherent.sexe} required>
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
            <Textarea 
              id="adresse" 
              name="adresse" 
              defaultValue={adherent.adresse || ''}
              className="transition-smooth" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faritra">Faritra</Label>
              <Select 
                name="faritra" 
                value={selectedFaritra}
                onValueChange={setSelectedFaritra}
                defaultValue={adherent.faritra || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le faritra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voalohany">Voalohany</SelectItem>
                  <SelectItem value="faharoa">Faharoa</SelectItem>
                  <SelectItem value="fahatelo">Fahatelo</SelectItem>
                  <SelectItem value="fahefatra">Fahefatra</SelectItem>
                  <SelectItem value="fahadimy">Fahadimy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quartier">Quartier</Label>
              <Select name="quartier" disabled={!selectedFaritra} defaultValue={adherent.quartier || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le quartier" />
                </SelectTrigger>
                <SelectContent>
                  {selectedFaritra && quartiersParFaritra[selectedFaritra as keyof typeof quartiersParFaritra]?.map((quartier) => (
                    <SelectItem key={quartier} value={quartier}>
                      {quartier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input 
              id="telephone" 
              name="telephone" 
              type="tel" 
              defaultValue={adherent.telephone || ''}
              className="transition-smooth" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                defaultValue={adherent.email || ''}
                className="transition-smooth" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fonction_eglise">Fonction dans l'église</Label>
              <Select name="fonction_eglise" defaultValue={adherent.fonction_eglise || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une fonction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pasteur">Pasteur</SelectItem>
                  <SelectItem value="Tresorier">Trésorier</SelectItem>
                  <SelectItem value="Secretaire">Secrétaire</SelectItem>
                  <SelectItem value="Diakona">Diacre</SelectItem>
                  <SelectItem value="Loholona">Ancien</SelectItem>
                  <SelectItem value="Membre">Membre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="etat_civil">État civil</Label>
              <Select name="etat_civil" defaultValue={adherent.etat_civil || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'état civil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celibataire">Célibataire</SelectItem>
                  <SelectItem value="marie">Marié(e)</SelectItem>
                  <SelectItem value="veuf">Veuf/Veuve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mpandray"
                  checked={mpandray}
                  onCheckedChange={(checked) => setMpandray(checked as boolean)}
                />
                <Label htmlFor="mpandray">Mpandray</Label>
              </div>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary hover:shadow-glow">
              {loading ? 'Modification en cours...' : 'Modifier l\'adhérent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}