import { GroupesManager } from "@/components/groupes/GroupesManager";

export default function Groupes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des Groupes</h1>
        <p className="text-muted-foreground">
          Gérez les groupes de l'église et leurs membres.
        </p>
      </div>
      
      <GroupesManager />
    </div>
  );
}