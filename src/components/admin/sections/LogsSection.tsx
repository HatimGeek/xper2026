import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LogsSection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Journaux</h2>
      <Card>
        <CardHeader>
          <CardTitle>Journaux d'activité</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section est en cours de développement. Elle affichera les logs d'activité du système.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
