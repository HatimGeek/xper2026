import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Check } from 'lucide-react';
import { getPublicMediaUrl, isImage, isVideo } from '@/lib/utils';

export const SectorMediaManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [targetSectorId, setTargetSectorId] = useState<string>('');
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const { data: sectors } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sectors').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: media } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: sectorMedia } = useQuery({
    queryKey: ['sector-media', selectedSector],
    queryFn: async () => {
      let query = supabase
        .from('sector_media')
        .select(`*, media:media_id (*), sectors:sector_id (name)`)
        .order('display_order');
      if (selectedSector && selectedSector !== 'all') {
        query = query.eq('sector_id', selectedSector);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ sectorId, mediaIds }: { sectorId: string; mediaIds: string[] }) => {
      const inserts = mediaIds.map((media_id, index) => ({
        sector_id: sectorId,
        media_id,
        display_order: index,
      }));
      const { error } = await supabase.from('sector_media').insert(inserts);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sector-media'] });
      toast.success(`${vars.mediaIds.length} média(s) ajouté(s) avec succès`);
      setIsDialogOpen(false);
      setSelectedMediaIds([]);
      setTargetSectorId('');
    },
    onError: (error: any) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sector_media').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-media'] });
      toast.success('Média supprimé');
    },
  });

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMediaIds(prev =>
      prev.includes(mediaId) ? prev.filter(id => id !== mediaId) : [...prev, mediaId]
    );
  };

  const handleSubmit = () => {
    if (!targetSectorId) {
      toast.error('Veuillez sélectionner un secteur');
      return;
    }
    if (selectedMediaIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un média');
      return;
    }
    createMutation.mutate({ sectorId: targetSectorId, mediaIds: selectedMediaIds });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Galerie Médias par Secteur</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setSelectedMediaIds([]); setTargetSectorId(''); }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter des médias
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter des médias au secteur</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Sector selector */}
              <div>
                <Label>Secteur *</Label>
                <Select value={targetSectorId} onValueChange={setTargetSectorId}>
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

              {/* Selected count */}
              <div className="flex items-center justify-between">
                <Label>
                  Médias * — <span className="text-primary font-bold">{selectedMediaIds.length} sélectionné(s)</span>
                </Label>
                {selectedMediaIds.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedMediaIds([])}>
                    Tout désélectionner
                  </Button>
                )}
              </div>

              {/* Media grid with checkboxes */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 border rounded-lg">
                {media?.map((m) => {
                  const url = getPublicMediaUrl(m.file_path);
                  const selected = selectedMediaIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMediaSelection(m.id)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selected ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                      }`}
                    >
                      {isImage(m.mime_type) && (
                        <img src={url} alt={m.filename} className="w-full h-24 object-cover" />
                      )}
                      {isVideo(m.mime_type) && (
                        <div className="w-full h-24 bg-black flex items-center justify-center text-white text-2xl">🎥</div>
                      )}
                      {selected && (
                        <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="p-1">
                        <p className="text-xs truncate text-muted-foreground">{m.filename}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending
                    ? 'Ajout en cours...'
                    : `Ajouter ${selectedMediaIds.length > 0 ? `(${selectedMediaIds.length})` : ''}`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
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

      {/* Gallery */}
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
                  <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Secteur: {sectorItem?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Ordre: {item.display_order}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};