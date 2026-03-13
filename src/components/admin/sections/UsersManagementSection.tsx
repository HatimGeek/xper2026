import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const UsersManagementSection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Utilisateurs</h2>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section est en cours de développement. Elle permettra de gérer les utilisateurs du système.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
