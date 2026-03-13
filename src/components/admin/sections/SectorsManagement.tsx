import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Download } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';
import { useSectors, useCreateSector, useUpdateSector, useDeleteSector } from '@/hooks/useSupabaseQuery';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Sector {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  hero_video_id?: string;
  created_at: string;
  updated_at: string;
}

export const SectorsManagement = () => {
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoMedia, setVideoMedia] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: sectors = [], isLoading: loading } = useSectors();
  const createSector = useCreateSector();
  const updateSector = useUpdateSector();
  const deleteSector = useDeleteSector();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    hero_video_id: '',
  });

  useEffect(() => {
    fetchVideoMedia();
  }, []);

  const fetchVideoMedia = async () => {
    const { data } = await supabase
      .from('media')
      .select('*')
      .like('mime_type', 'video%')
      .order('created_at', { ascending: false });
    setVideoMedia(data || []);
  };


  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      slug: name === 'name' ? generateSlug(value) : prev.slug,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      hero_video_id: '',
    });
    setEditingSector(null);
  };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name,
      slug: sector.slug,
      description: sector.description || '',
      icon: sector.icon || '',
      hero_video_id: sector.hero_video_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSector) {
        await updateSector.mutateAsync({
          id: editingSector.id,
          updates: {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            icon: formData.icon,
            hero_video_id: formData.hero_video_id || null,
          }
        });

        toast({
          title: "Secteur modifié",
          description: "Le secteur a été modifié avec succès.",
        });
      } else {
        await createSector.mutateAsync({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          icon: formData.icon,
          hero_video_id: formData.hero_video_id || null,
          display_order: sectors.length,
        });

        toast({
          title: "Secteur créé",
          description: "Le secteur a été créé avec succès.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['public-sectors'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const handleDelete = async (sectorId: string) => {
    try {
      await deleteSector.mutateAsync(sectorId);

      toast({
        title: "Secteur supprimé",
        description: "Le secteur a été supprimé avec succès.",
      });

      queryClient.invalidateQueries({ queryKey: ['public-sectors'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const toggleActive = async (sector: Sector) => {
    try {
      await updateSector.mutateAsync({
        id: sector.id,
        updates: { is_active: !sector.is_active }
      });

      toast({
        title: sector.is_active ? "Secteur désactivé" : "Secteur activé",
        description: `Le secteur a été ${sector.is_active ? 'désactivé' : 'activé'} avec succès.`,
      });

      queryClient.invalidateQueries({ queryKey: ['public-sectors'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sectors);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index,
    }));

    try {
      for (const update of updates) {
        await updateSector.mutateAsync({
          id: update.id,
          updates: { display_order: update.display_order }
        });
      }
      
      toast({
        title: "Ordre modifié",
        description: "L'ordre des secteurs a été mis à jour.",
      });

      queryClient.invalidateQueries({ queryKey: ['public-sectors'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold">Gestion des Secteurs</h2>
            <p className="text-muted-foreground">Gérez les secteurs d'activité de votre entreprise</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold">Gestion des Secteurs</h2>
          <p className="text-muted-foreground">Gérez les secteurs d'activité de votre entreprise</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              const formattedData = formatDataForExport(sectors, 'sectors');
              exportToCSV(formattedData, 'secteurs');
              toast({
                title: "Export réussi",
                description: "Les secteurs ont été exportés en CSV.",
              });
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Secteur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSector ? 'Modifier le secteur' : 'Créer un nouveau secteur'}
              </DialogTitle>
              <DialogDescription>
                {editingSector 
                  ? 'Modifiez les informations du secteur ci-dessous.'
                  : 'Ajoutez un nouveau secteur d\'activité à votre site.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du secteur</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex: Automobile"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="automobile"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Réparation et restauration de cuir automobile"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icône (nom Lucide)</Label>
                <Input
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="Car"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero_video_id">Vidéo Hero (optionnel)</Label>
                <select
                  id="hero_video_id"
                  name="hero_video_id"
                  value={formData.hero_video_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, hero_video_id: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Aucune vidéo</option>
                  {videoMedia.map((media) => (
                    <option key={media.id} value={media.id}>
                      🎥 {media.original_filename}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Cette vidéo s'affichera sur la page du secteur
                </p>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingSector ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sectors">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {sectors.map((sector, index) => (
                <Draggable key={sector.id} draggableId={sector.id} index={index}>
                  {(provided, snapshot) => (
                    <Card 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{sector.name}</h3>
                                <Badge 
                                  variant={sector.is_active ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {sector.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                /{sector.slug}
                              </p>
                              {sector.description && (
                                <p className="text-sm">{sector.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActive(sector)}
                            >
                              {sector.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(sector)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le secteur</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer le secteur "{sector.name}" ? 
                                    Cette action est irréversible et supprimera aussi tous les services associés.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(sector.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {sectors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Aucun secteur trouvé. Créez votre premier secteur d'activité.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};