import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Check, X, Eye, Image as ImageIcon, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';
import { useQueryClient } from '@tanstack/react-query';

interface MediaPair {
  id: string;
  title: string;
  description?: string;
  before_media_id: string;
  after_media_id: string;
  status: 'draft' | 'published' | 'archived';
  client_consent: boolean;
  service_id?: string;
  sector_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  before?: {
    id: string;
    filename: string;
    file_path: string;
    alt_text?: string;
  } | null;
  after?: {
    id: string;
    filename: string;
    file_path: string;
    alt_text?: string;
  } | null;
  sectors?: { name: string } | null;
  services?: { title: string } | null;
}

interface Media {
  id: string;
  filename: string;
  file_path: string;
  original_filename: string;
  mime_type?: string;
}

interface Sector {
  id: string;
  name: string;
}

interface Service {
  id: string;
  title: string;
  sector_id: string;
}

export const MediaPairsManagement = () => {
  const [mediaPairs, setMediaPairs] = useState<MediaPair[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPair, setEditingPair] = useState<MediaPair | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    before_media_id: '',
    after_media_id: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    client_consent: false,
    service_id: '',
    sector_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pairsResult, mediaResult, sectorsResult, servicesResult] = await Promise.all([
        supabase
          .from('media_pairs')
          .select(`
            *,
            before:media!media_pairs_before_media_id_fkey (id, filename, file_path, alt_text),
            after:media!media_pairs_after_media_id_fkey (id, filename, file_path, alt_text),
            sectors:sector_id (name),
            services:service_id (title)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('media')
          .select('id, filename, file_path, original_filename, mime_type')
          .order('created_at', { ascending: false }),
        supabase
          .from('sectors')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('services')
          .select('id, title, sector_id')
          .eq('status', 'published')
          .order('title')
      ]);

      if (pairsResult.error) throw pairsResult.error;
      if (mediaResult.error) throw mediaResult.error;
      if (sectorsResult.error) throw sectorsResult.error;
      if (servicesResult.error) throw servicesResult.error;

      setMediaPairs((pairsResult.data || []) as unknown as MediaPair[]);
      setMedia(mediaResult.data || []);
      setSectors(sectorsResult.data || []);
      setServices(servicesResult.data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      before_media_id: '',
      after_media_id: '',
      status: 'draft',
      client_consent: false,
      service_id: '',
      sector_id: '',
    });
    setEditingPair(null);
  };

  const handleEdit = (pair: MediaPair) => {
    setEditingPair(pair);
    setFormData({
      title: pair.title,
      description: pair.description || '',
      before_media_id: pair.before_media_id,
      after_media_id: pair.after_media_id,
      status: pair.status,
      client_consent: pair.client_consent,
      service_id: pair.service_id || '',
      sector_id: pair.sector_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.before_media_id === formData.after_media_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les médias avant et après doivent être différents.",
      });
      return;
    }
    
    try {
      if (editingPair) {
        // Update existing pair
        const { error } = await supabase
          .from('media_pairs')
          .update({
            title: formData.title,
            description: formData.description,
            before_media_id: formData.before_media_id,
            after_media_id: formData.after_media_id,
            status: formData.status,
            client_consent: formData.client_consent,
            service_id: formData.service_id || null,
            sector_id: formData.sector_id || null,
          })
          .eq('id', editingPair.id);

        if (error) throw error;

        toast({
          title: "Avant/Après modifié",
          description: "L'avant/après a été modifié avec succès.",
        });

        // Rafraîchir les listes côté admin et public
        queryClient.invalidateQueries({ queryKey: ['media-pairs'] });
        queryClient.invalidateQueries({ queryKey: ['public-media-pairs'] });
      } else {
        // Create new pair
        const { error } = await supabase
          .from('media_pairs')
          .insert({
            title: formData.title,
            description: formData.description,
            before_media_id: formData.before_media_id,
            after_media_id: formData.after_media_id,
            status: formData.status,
            client_consent: formData.client_consent,
            service_id: formData.service_id || null,
            sector_id: formData.sector_id || null,
          });

        if (error) throw error;

        toast({
          title: "Avant/Après créé",
          description: "L'avant/après a été créé avec succès.",
        });

        // Rafraîchir les listes côté admin et public
        queryClient.invalidateQueries({ queryKey: ['media-pairs'] });
        queryClient.invalidateQueries({ queryKey: ['public-media-pairs'] });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const handleStatusChange = async (pairId: string, newStatus: 'draft' | 'published') => {
    try {
      const { error } = await supabase
        .from('media_pairs')
        .update({ status: newStatus })
        .eq('id', pairId);

      if (error) throw error;

      toast({
        title: "Statut modifié",
        description: `L'avant/après a été ${newStatus === 'published' ? 'publié' : 'mis en brouillon'}.`,
      });

      // Rafraîchir les listes côté admin et public
      queryClient.invalidateQueries({ queryKey: ['media-pairs'] });
      queryClient.invalidateQueries({ queryKey: ['public-media-pairs'] });

      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const handleDelete = async (pairId: string) => {
    try {
      const { error } = await supabase
        .from('media_pairs')
        .delete()
        .eq('id', pairId);

      if (error) throw error;

      toast({
        title: "Avant/Après supprimé",
        description: "L'avant/après a été supprimé avec succès.",
      });

      // Rafraîchir les listes côté admin et public
      queryClient.invalidateQueries({ queryKey: ['media-pairs'] });
      queryClient.invalidateQueries({ queryKey: ['public-media-pairs'] });

      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>;
      default:
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

  const getMediaUrl = (filePath: string) => {
    return `https://cssixjhhrvtnzsrzsjsf.supabase.co/storage/v1/object/public/media/${filePath}`;
  };

  const filteredPairs = mediaPairs.filter(pair => {
    if (selectedStatus === 'all') return true;
    return pair.status === selectedStatus;
  });

  const filteredServices = services.filter(service => 
    !formData.sector_id || service.sector_id === formData.sector_id
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold">Gestion Avant/Après</h2>
            <p className="text-muted-foreground">Gérez les photos avant/après</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-32 bg-muted rounded"></div>
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
          <h2 className="text-2xl font-heading font-bold">Gestion Avant/Après</h2>
          <p className="text-muted-foreground">Gérez les photos avant/après</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedStatus} onValueChange={(value: 'all' | 'draft' | 'published' | 'archived') => setSelectedStatus(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
            </SelectContent>
          </Select>

          {hasRole(['admin', 'editor']) && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Avant/Après
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPair ? 'Modifier l\'avant/après' : 'Créer un nouvel avant/après'}
                  </DialogTitle>
                  <DialogDescription>
                    Sélectionnez deux médias pour créer une comparaison avant/après.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="ex: Réparation siège BMW"
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
                      placeholder="Description détaillée du travail effectué"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="before_media_id">Média AVANT (photo/vidéo)</Label>
                      <Select value={formData.before_media_id} onValueChange={(value) => setFormData(prev => ({ ...prev, before_media_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un média" />
                        </SelectTrigger>
                        <SelectContent>
                          {media.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.original_filename} {item.mime_type?.startsWith('video/') ? '🎥' : '📷'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="after_media_id">Média APRÈS (photo/vidéo)</Label>
                      <Select value={formData.after_media_id} onValueChange={(value) => setFormData(prev => ({ ...prev, after_media_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un média" />
                        </SelectTrigger>
                        <SelectContent>
                          {media.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.original_filename} {item.mime_type?.startsWith('video/') ? '🎥' : '📷'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sector_id">Secteur</Label>
                       <Select value={formData.sector_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, sector_id: value === 'none' ? '' : value, service_id: '' }))}>
                         <SelectTrigger>
                           <SelectValue placeholder="Sélectionner un secteur" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="none">Aucun secteur</SelectItem>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="service_id">Service</Label>
                       <Select value={formData.service_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value === 'none' ? '' : value }))}>
                         <SelectTrigger>
                           <SelectValue placeholder="Sélectionner un service" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="none">Aucun service</SelectItem>
                          {filteredServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="client_consent"
                      checked={formData.client_consent}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, client_consent: checked }))}
                    />
                    <Label htmlFor="client_consent">Consentement client obtenu</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
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
                      {editingPair ? 'Modifier' : 'Créer'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPairs.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun avant/après trouvé. Créez votre premier avant/après.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredPairs.map((pair) => (
            <Card key={pair.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {pair.title}
                      {getStatusBadge(pair.status)}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {pair.sectors && <span>Secteur: {pair.sectors.name}</span>}
                      {pair.services && <span> • Service: {pair.services.title}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {pair.client_consent ? (
                        <Badge variant="outline" className="text-green-600">
                          ✓ Consentement
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          ✗ Pas de consentement
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {hasRole(['admin', 'editor', 'moderator']) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(pair.id, pair.status === 'published' ? 'draft' : 'published')}
                        >
                          {pair.status === 'published' ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {hasRole(['admin', 'editor']) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pair)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {hasRole(['admin', 'editor']) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'avant/après</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer "{pair.title}" ? 
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(pair.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">AVANT</p>
                    {pair.before && (
                      <img
                        src={getMediaUrl(pair.before.file_path)}
                        alt={pair.before.alt_text || 'Avant'}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">APRÈS</p>
                    {pair.after && (
                      <img
                        src={getMediaUrl(pair.after.file_path)}
                        alt={pair.after.alt_text || 'Après'}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                {pair.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pair.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};