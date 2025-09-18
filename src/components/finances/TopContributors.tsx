import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Contributor {
  id: string;
  nom: string;
  prenom: string;
  total: number;
  contributions_count: number;
}

export const TopContributors = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('year');

  useEffect(() => {
    fetchTopContributors();
  }, [period]);

  const fetchTopContributors = async () => {
    try {
      setLoading(true);
      
      // Date calculation based on period
      let dateFilter = new Date();
      if (period === 'month') {
        dateFilter.setMonth(dateFilter.getMonth() - 1);
      } else if (period === 'year') {
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
      } else {
        dateFilter = new Date('2000-01-01'); // All time
      }

      const { data, error } = await supabase
        .from('contributions')
        .select(`
          montant,
          adherent_id,
          adherents!inner(nom, prenom)
        `)
        .gte('date_contribution', dateFilter.toISOString().split('T')[0]);

      if (error) throw error;

      // Group by adherent and calculate totals
      const contributorMap = new Map<string, Contributor>();
      
      data?.forEach((contribution: any) => {
        const id = contribution.adherent_id;
        const existing = contributorMap.get(id);
        
        if (existing) {
          existing.total += Number(contribution.montant);
          existing.contributions_count += 1;
        } else {
          contributorMap.set(id, {
            id,
            nom: contribution.adherents.nom,
            prenom: contribution.adherents.prenom,
            total: Number(contribution.montant),
            contributions_count: 1
          });
        }
      });

      // Convert to array and sort by total
      const sortedContributors = Array.from(contributorMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); // Top 10

      setContributors(sortedContributors);
    } catch (error) {
      console.error('Error fetching top contributors:', error);
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 1:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case 2:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Contributeurs
          </CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant={period === 'month' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPeriod('month')}
            >
              Mois
            </Badge>
            <Badge 
              variant={period === 'year' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPeriod('year')}
            >
              Année
            </Badge>
            <Badge 
              variant={period === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPeriod('all')}
            >
              Tout
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : contributors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune contribution trouvée pour cette période
          </p>
        ) : (
          <div className="space-y-4">
            {contributors.map((contributor, index) => (
              <div 
                key={contributor.id} 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge className={`w-8 h-8 rounded-full p-0 flex items-center justify-center ${getRankBadge(index)}`}>
                    {getRankIcon(index) || (index + 1)}
                  </Badge>
                  <Avatar>
                    <AvatarFallback>
                      {contributor.prenom[0]}{contributor.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {contributor.prenom} {contributor.nom}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contributor.contributions_count} contribution{contributor.contributions_count > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatCurrency(contributor.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};