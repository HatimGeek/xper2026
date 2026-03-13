import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useSupabaseQuery';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sector_id: string;
  status: 'draft' | 'published' | 'archived';
  display_order: number;
  price_range: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  sectors?: { name: string };
}

interface Sector {
  id: string;
  name: string;
}

export const ServicesManagement = () => {
  const { data: services = [], isLoading: loading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    sector_id: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    price_range: '',
    meta_title: '',
    meta_description: '',
    display_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSectors(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les secteurs",
        variant: "destructive",
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      short_description: '',
      sector_id: '',
      status: 'draft',
      price_range: '',
      meta_title: '',
      meta_description: '',
      display_order: 0
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      description: service.description || '',
      short_description: service.short_description || '',
      sector_id: service.sector_id,
      status: service.status,
      price_range: service.price_range || '',
      meta_title: service.meta_title || '',
      meta_description: service.meta_description || '',
      display_order: service.display_order
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          updates: {
            ...formData,
            updated_at: new Date().toISOString()
          }
        });

        toast({
          title: "Succès",
          description: "Service modifié avec succès",
        });
      } else {
        await createService.mutateAsync(formData);

        toast({
          title: "Succès",
          description: "Service créé avec succès",
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteService.mutateAsync(deleteId);

      toast({
        title: "Succès",
        description: "Service supprimé avec succès",
      });

      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      await updateService.mutateAsync({
        id,
        updates: { status: newStatus }
      });

      toast({
        title: "Succès",
        description: `Service ${newStatus === 'published' ? 'publié' : 'mis en brouillon'}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading">Gestion des Services</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Modifier le Service' : 'Nouveau Service'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sector_id">Secteur *</Label>
                <Select value={formData.sector_id} onValueChange={(value) => handleSelectChange('sector_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="short_description">Description courte</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Description complète</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_range">Gamme de prix</Label>
                  <Input
                    id="price_range"
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleInputChange}
                    placeholder="Ex: 50€ - 200€"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Ordre d'affichage</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="meta_title">Meta Titre (SEO)</Label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingService ? 'Modifier' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Aucun service trouvé</p>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {service.title}
                    <Badge variant={service.status === 'published' ? 'default' : 'secondary'}>
                      {service.status === 'published' ? 'Publié' : service.status === 'draft' ? 'Brouillon' : 'Archivé'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Secteur: {service.sectors?.name} • Ordre: {service.display_order}
                  </p>
                  {service.short_description && (
                    <p className="text-sm text-muted-foreground mt-2">{service.short_description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(service.id, service.status)}
                  >
                    {service.status === 'published' ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service as Service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};