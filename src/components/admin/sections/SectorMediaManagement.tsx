import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { getPublicMediaUrl, isImage, isVideo } from '@/lib/utils';

export const SectorMediaManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [formData, setFormData] = useState({
    sector_id: '',
    media_id: '',
    title: '',
    description: '',
    display_order: 0,
  });

  // Fetch sectors
  const { data: sectors } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sectors').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch media
  const { data: media } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch sector media
  const { data: sectorMedia } = useQuery({
    queryKey: ['sector-media', selectedSector],
    queryFn: async () => {
      let query = supabase
        .from('sector_media')
        .select(`
          *,
          media:media_id (*),
          sectors:sector_id (name)
        `)
        .order('display_order');

      if (selectedSector && selectedSector !== 'all') {
        query = query.eq('sector_id', selectedSector);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const { data, error } = await supabase
        .from('sector_media')
        .insert([newData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-media'] });
      toast.success('Média ajouté avec succès');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'ajout: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sector_media').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-media'] });
      toast.success('Média supprimé');
    },
    onError: (error: any) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      sector_id: '',
      media_id: '',
      title: '',
      description: '',
      display_order: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Galerie Médias par Secteur</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un média
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un média au secteur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Secteur *</Label>
                <Select value={formData.sector_id} onValueChange={(value) => setFormData({ ...formData, sector_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Média *</Label>
                <Select value={formData.media_id} onValueChange={(value) => setFormData({ ...formData, media_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fichier" />
                  </SelectTrigger>
                  <SelectContent>
                    {media?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {isVideo(m.mime_type) ? '🎥' : '📷'} {m.filename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Titre</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre du média"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du média"
                />
              </div>

              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <Label>Filtrer par secteur</Label>
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Tous les secteurs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les secteurs</SelectItem>
            {sectors?.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectorMedia?.map((item) => {
          const mediaItem = item.media as any;
          const mediaUrl = getPublicMediaUrl(mediaItem.file_path);
          const sectorItem = item.sectors as any;

          return (
            <Card key={item.id}>
              <CardHeader className="p-0">
                {isImage(mediaItem.mime_type) && (
                  <img src={mediaUrl} alt={item.title || ''} className="w-full h-48 object-cover rounded-t-lg" />
                )}
                {isVideo(mediaItem.mime_type) && (
                  <video src={mediaUrl} className="w-full h-48 object-cover rounded-t-lg" controls />
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-sm">{item.title || mediaItem.filename}</CardTitle>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Secteur: {sectorItem?.name}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Ordre: {item.display_order}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
