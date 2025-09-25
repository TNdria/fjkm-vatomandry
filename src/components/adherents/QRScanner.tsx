import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, QrCode, CheckCircle, XCircle, Loader2 } from "lucide-react";
import QrScanner from "qr-scanner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScannedAdherent {
  id: string;
  nom: string;
  prenom: string;
  mpandray: boolean;
  adidyRecord?: {
    id: string;
    montant: number;
    paye: boolean;
    date_paiement: string | null;
    mois: number;
    annee: number;
  };
}

export function QRScanner({ onPaymentSuccess }: { onPaymentSuccess?: () => void }) {
  console.log("QRScanner component rendered");
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAdherent, setScannedAdherent] = useState<ScannedAdherent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(500);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    return () => {
      // Cleanup scanner when component unmounts
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      
      // Vérifier les permissions de caméra
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        toast({
          title: "Caméra non disponible",
          description: "Aucune caméra n'a été détectée sur cet appareil",
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }
      
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("Résultat du scan:", result.data);
          handleScanResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Utiliser la caméra arrière si disponible
        }
      );

      await qrScannerRef.current.start();
      console.log("Scanner QR démarré avec succès");
    } catch (error) {
      console.error("Erreur lors du démarrage du scanner:", error);
      let errorMessage = "Impossible d'accéder à la caméra";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Accès à la caméra refusé. Veuillez autoriser l'accès à la caméra dans les paramètres.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Aucune caméra trouvée sur cet appareil";
        }
      }
      
      toast({
        title: "Erreur de caméra",
        description: errorMessage,
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const handleScanResult = async (data: string) => {
    stopScanning();
    
    try {
      // Le QR code contient l'ID de l'adhérent
      const adherentId = data.trim();
      
      console.log("QR Code scanné:", adherentId);
      
      // Vérifier que l'adhérent existe et est Mpandray
      const { data: adherent, error: adherentError } = await supabase
        .from('adherents')
        .select('id_adherent, nom, prenom, mpandray')
        .eq('id_adherent', adherentId)
        .maybeSingle();

      if (adherentError) {
        console.error("Erreur Supabase:", adherentError);
        toast({
          title: "Erreur de base de données",
          description: adherentError.message,
          variant: "destructive",
        });
        return;
      }

      if (!adherent) {
        toast({
          title: "Adhérent introuvable",
          description: `L'adhérent avec l'ID "${adherentId}" n'existe pas dans la base de données`,
          variant: "destructive",
        });
        return;
      }

      if (!adherent.mpandray) {
        toast({
          title: "Adhérent non Mpandray",
          description: "Cet adhérent n'est pas enregistré comme Mpandray",
          variant: "destructive",
        });
        return;
      }

      // Vérifier le paiement Adidy du mois en cours
      const { data: adidyRecord, error: adidyError } = await supabase
        .from('adidy')
        .select('*')
        .eq('adherent_id', adherentId)
        .eq('mois', currentMonth)
        .eq('annee', currentYear)
        .maybeSingle();

      if (adidyError) {
        console.error("Erreur lors de la vérification Adidy:", adidyError);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier le statut du paiement",
          variant: "destructive",
        });
        return;
      }

      setScannedAdherent({
        id: adherent.id_adherent,
        nom: adherent.nom,
        prenom: adherent.prenom,
        mpandray: adherent.mpandray,
        adidyRecord: adidyRecord || undefined,
      });

    } catch (error) {
      console.error("Erreur lors du traitement du scan:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement du QR code",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!scannedAdherent || !scannedAdherent.adidyRecord) return;

    setProcessing(true);

    try {
      const { error } = await supabase
        .from('adidy')
        .update({
          paye: true,
          montant: paymentAmount,
          date_paiement: new Date().toISOString().split('T')[0]
        })
        .eq('id', scannedAdherent.adidyRecord.id);

      if (error) throw error;

      toast({
        title: "Paiement enregistré",
        description: `Paiement de ${paymentAmount} Ar enregistré avec succès`,
      });

      // Rafraîchir les données parent
      onPaymentSuccess?.();

      // Mettre à jour l'état local
      setScannedAdherent(prev => prev ? {
        ...prev,
        adidyRecord: prev.adidyRecord ? {
          ...prev.adidyRecord,
          paye: true,
          montant: paymentAmount,
          date_paiement: new Date().toISOString().split('T')[0]
        } : undefined
      } : null);

    } catch (error) {
      console.error("Erreur lors de l'enregistrement du paiement:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetScan = () => {
    setScannedAdherent(null);
    setPaymentAmount(500);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    stopScanning();
    resetScan();
  };

  console.log("QRScanner rendering button");
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <QrCode className="h-4 w-4" />
          Scanner QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner QR Code Mpandray</DialogTitle>
        </DialogHeader>

        {!scannedAdherent ? (
          <div className="space-y-4">
            {!isScanning ? (
              <div className="text-center space-y-4">
                <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour scanner le QR code d'un Mpandray
                </p>
                <Button onClick={startScanning} className="w-full">
                  Démarrer le scan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                />
                <Button onClick={stopScanning} variant="outline" className="w-full">
                  Arrêter le scan
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {scannedAdherent.nom} {scannedAdherent.prenom}
                </CardTitle>
                <CardDescription>
                  Mpandray - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scannedAdherent.adidyRecord ? (
                  scannedAdherent.adidyRecord.paye ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Badge variant="default">Déjà payé</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Montant:</strong> {scannedAdherent.adidyRecord.montant} Ar</p>
                        <p><strong>Date de paiement:</strong> {new Date(scannedAdherent.adidyRecord.date_paiement!).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <Badge variant="secondary">Non payé</Badge>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Montant payé</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="amount"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">Ar</span>
                        </div>
                      </div>
                      <Button 
                        onClick={handlePayment} 
                        disabled={processing || paymentAmount <= 0}
                        className="w-full"
                      >
                        {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Valider le paiement
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm">Aucun enregistrement Adidy pour ce mois</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={resetScan} variant="outline" className="w-full">
              Scanner un autre QR code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}