import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paramètres</h2>
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du système</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section est en cours de développement. Elle permettra de configurer les paramètres du système.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
