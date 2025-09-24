import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, Crown, User, FileText, Wallet, UserCircle } from "lucide-react";

interface RoleStats {
  role: string;
  count: number;
  percentage: number;
  description: string;
  icon: any;
  color: string;
}

export function RolesManagement() {
  const [roleStats, setRoleStats] = useState<RoleStats[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleStats();
  }, []);

  const fetchRoleStats = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role');

      if (error) throw error;

      const total = data?.length || 0;
      setTotalUsers(total);

      const roleCounts = data?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.role] = (acc[curr.role] || 0) + 1;
        return acc;
      }, {}) || {};

      const roleDefinitions = [
        {
          role: 'ADMIN',
          description: 'Accès complet au système, peut gérer tous les utilisateurs et paramètres',
          icon: Crown,
          color: 'destructive'
        },
        {
          role: 'RESPONSABLE',
          description: 'Peut gérer les adhérents et les groupes, accès limité aux paramètres',
          icon: Shield,
          color: 'default'
        },
        {
          role: 'SECRETAIRE',
          description: 'Gère les documents administratifs et les rapports',
          icon: FileText,
          color: 'outline'
        },
        {
          role: 'TRESORIER',
          description: 'Gère les finances, contributions et rapports financiers',
          icon: Wallet,
          color: 'outline'
        },
        {
          role: 'MEMBRE',
          description: 'Membre de l\'église avec accès à son profil personnel',
          icon: UserCircle,
          color: 'secondary'
        },
        {
          role: 'UTILISATEUR',
          description: 'Accès de base en lecture seule aux données des adhérents (déprécié - utilisez MEMBRE)',
          icon: User,
          color: 'secondary'
        }
      ];

      const stats = roleDefinitions.map(def => ({
        ...def,
        count: roleCounts[def.role] || 0,
        percentage: total > 0 ? Math.round(((roleCounts[def.role] || 0) / total) * 100) : 0
      }));

      setRoleStats(stats);
    } catch (error: any) {
      console.error('Error fetching role stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-6 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-2 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Répartition des rôles
          </CardTitle>
          <CardDescription>
            Aperçu de la distribution des rôles parmi les {totalUsers} utilisateurs
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roleStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.role}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={stat.percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {stat.percentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions par rôle</CardTitle>
          <CardDescription>
            Détail des permissions accordées à chaque rôle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Badge variant="destructive">ADMIN</Badge>
                <div className="text-sm">
                  <strong>Permissions complètes :</strong>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground">
                    <li>Gestion complète des utilisateurs et rôles</li>
                    <li>Ajout, modification et suppression des adhérents</li>
                    <li>Gestion complète des groupes</li>
                    <li>Accès aux statistiques et paramètres système</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="default">RESPONSABLE</Badge>
                <div className="text-sm">
                  <strong>Permissions étendues :</strong>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground">
                    <li>Ajout et modification des adhérents</li>
                    <li>Gestion des groupes et associations</li>
                    <li>Consultation des statistiques</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline">SECRÉTAIRE</Badge>
                <div className="text-sm">
                  <strong>Permissions administratives :</strong>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground">
                    <li>Ajout et modification des adhérents</li>
                    <li>Génération de rapports et documents</li>
                    <li>Gestion des cartes de membres</li>
                    <li>Export des données en Excel/PDF</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline">TRÉSORIER</Badge>
                <div className="text-sm">
                  <strong>Permissions financières :</strong>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground">
                    <li>Gestion complète des finances</li>
                    <li>Enregistrement des contributions</li>
                    <li>Génération de rapports financiers</li>
                    <li>Accès aux statistiques financières</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="secondary">MEMBRE</Badge>
                <div className="text-sm">
                  <strong>Accès personnel :</strong>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground">
                    <li>Consultation de son profil personnel</li>
                    <li>Visualisation de ses contributions</li>
                    <li>Téléchargement de sa carte de membre</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="secondary">UTILISATEUR (déprécié)</Badge>
                <div className="text-sm">
                  <strong>Permissions de base :</strong>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground">
                    <li>Consultation des adhérents</li>
                    <li>Consultation des groupes</li>
                    <li>Accès aux statistiques de base</li>
                    <li><em>Note: Ce rôle a été remplacé par MEMBRE</em></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}