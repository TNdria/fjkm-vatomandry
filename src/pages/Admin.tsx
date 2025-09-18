import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Settings, Database } from "lucide-react";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { RolesManagement } from "@/components/admin/RolesManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { DatabaseManagement } from "@/components/admin/DatabaseManagement";
import { AdminRoute } from "@/components/AdminRoute";

export default function Admin() {

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Administration</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Panneau d'administration pour la gestion du système
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground font-medium">
              Accès administrateur
            </span>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Shield className="h-3 w-3 md:h-4 md:w-4" />
              Rôles
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Paramètres</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Database className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Base de données</span>
              <span className="sm:hidden">BDD</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="roles">
            <RolesManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  );
}