import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAllClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useSupabaseQuery";
import { Building2, Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ClientsManagement = () => {
  const { data: clients = [], isLoading } = useAllClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    logo_url: "",
    display_order: 0,
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `clients/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo_url: publicUrl });
      toast.success("Logo uploadé avec succès");
    } catch (error: any) {
      toast.error("Erreur lors de l'upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.logo_url) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          updates: formData,
        });
        toast.success("Client mis à jour");
      } else {
        await createClient.mutateAsync(formData);
        toast.success("Client ajouté");
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      website_url: client.website_url || "",
      logo_url: client.logo_url,
      display_order: client.display_order,
      is_active: client.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;
    
    try {
      await deleteClient.mutateAsync(id);
      toast.success("Client supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      website_url: "",
      logo_url: "",
      display_order: 0,
      is_active: true,
    });
    setEditingClient(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Logos Clients</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client: any) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {client.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {client.logo_url ? (
                  <img 
                    src={client.logo_url} 
                    alt={client.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ordre:</span>
                  <span>{client.display_order}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Actif:</span>
                  <Switch checked={client.is_active} disabled />
                </div>
                {client.website_url && (
                  <div className="text-xs text-muted-foreground truncate">
                    {client.website_url}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEdit(client)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleDelete(client.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun client ajouté pour le moment
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Modifier le client" : "Ajouter un client"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du client *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de l'entreprise"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo *</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {formData.logo_url && (
                <div className="mt-2 p-2 border rounded-lg">
                  <img 
                    src={formData.logo_url} 
                    alt="Preview" 
                    className="w-full h-32 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordre d'affichage</Label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Actif</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={uploading || !formData.logo_url}>
                {editingClient ? "Mettre à jour" : "Ajouter"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsDialogOpen(false); resetForm(); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
