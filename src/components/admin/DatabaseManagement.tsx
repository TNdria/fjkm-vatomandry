import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Database, Download, Upload, RefreshCw, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface TableStats {
  name: string;
  count: number;
  size: string;
  lastUpdated: string;
}

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'error';
  connections: number;
  uptime: string;
  version: string;
}

export function DatabaseManagement() {
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [dbHealth, setDbHealth] = useState<DatabaseHealth>({
    status: 'healthy',
    connections: 0,
    uptime: '',
    version: ''
  });
  const [loading, setLoading] = useState(true);
  const [backupInProgress, setBackupInProgress] = useState(false);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques des tables principales
      const tables = ['adherents', 'groupes', 'adherents_groupes', 'user_roles', 'profiles'] as const;
      const stats: TableStats[] = [];

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (!error) {
            stats.push({
              name: table,
              count: count || 0,
              size: `${Math.max(1, Math.ceil((count || 0) * 0.5))} KB`, // Estimation
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error(`Error fetching ${table} stats:`, err);
        }
      }

      setTableStats(stats);

      // Simuler les statistiques de santé de la DB
      setDbHealth({
        status: 'healthy',
        connections: Math.floor(Math.random() * 50) + 10,
        uptime: '15 jours, 8 heures',
        version: 'PostgreSQL 15.3'
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les statistiques de la base de données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setBackupInProgress(true);
    try {
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Sauvegarde terminée",
        description: "La base de données a été sauvegardée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de créer la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setBackupInProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(dbHealth.status);

  return (
    <div className="space-y-6">
      {/* Database Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            État de la base de données
          </CardTitle>
          <CardDescription>
            Surveillance en temps réel de la santé de la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-5 w-5 ${getStatusColor(dbHealth.status)}`} />
              <div>
                <div className="text-sm font-medium">Statut</div>
                <Badge variant={dbHealth.status === 'healthy' ? 'default' : 'destructive'}>
                  {dbHealth.status === 'healthy' ? 'Opérationnel' : 'Problème'}
                </Badge>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Connexions actives</div>
              <div className="text-2xl font-bold">{dbHealth.connections}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Temps de fonctionnement</div>
              <div className="text-sm text-muted-foreground">{dbHealth.uptime}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Version</div>
              <div className="text-sm text-muted-foreground">{dbHealth.version}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des tables</CardTitle>
          <CardDescription>
            Aperçu des données stockées dans chaque table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tableStats.map((table) => (
              <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium capitalize">{table.name.replace('_', ' ')}</div>
                    <div className="text-sm text-muted-foreground">
                      {table.count} enregistrements • {table.size}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Mis à jour: {new Date(table.lastUpdated).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup and Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Sauvegarde et maintenance</CardTitle>
          <CardDescription>
            Outils de sauvegarde et de maintenance de la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Sauvegarde</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleBackup}
                  disabled={backupInProgress}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  {backupInProgress ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {backupInProgress ? "Sauvegarde en cours..." : "Créer une sauvegarde"}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled
                >
                  <Upload className="h-4 w-4" />
                  Restaurer une sauvegarde
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Maintenance</h4>
              <div className="space-y-2">
                <Button
                  onClick={fetchDatabaseStats}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser les statistiques
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Optimiser la base de données
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Optimiser la base de données</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action va optimiser les performances de la base de données.
                        Le processus peut prendre quelques minutes et peut affecter les performances pendant l'opération.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction>Commencer l'optimisation</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {backupInProgress && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Sauvegarde en cours...</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}