import { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, Download, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';

interface Media {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
}

export const MediaManagement = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedias();
  }, []);

  const fetchMedias = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedias(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les médias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName;

        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save media record to database
        const { error: dbError } = await supabase
          .from('media')
          .insert([{
            filename: fileName,
            original_filename: file.name,
            file_path: filePath,
            mime_type: file.type,
            file_size: file.size,
            alt_text: file.name.split('.')[0], // Default alt text
          }]);

        if (dbError) throw dbError;
      }

      toast({
        title: "Succès",
        description: `${files.length} fichier(s) uploadé(s) avec succès`,
      });

      fetchMedias();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const media = medias.find(m => m.id === deleteId);
      if (!media) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([media.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', deleteId);

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Média supprimé avec succès",
      });

      fetchMedias();
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMediaUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const openMediaDetail = async (media: Media) => {
    setSelectedMedia(media);
    if (media.mime_type?.startsWith('image/')) {
      setPreviewUrl(getMediaUrl(media.file_path));
    } else {
      setPreviewUrl(null);
    }
    setIsDetailDialogOpen(true);
  };

  const updateMediaAltText = async (mediaId: string, altText: string) => {
    try {
      const { error } = await supabase
        .from('media')
        .update({ alt_text: altText })
        .eq('id', mediaId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Texte alternatif mis à jour",
      });

      fetchMedias();
      setSelectedMedia(prev => prev ? { ...prev, alt_text: altText } : null);
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
        <h2 className="text-2xl font-heading">Gestion des Médias</h2>
        <div>
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Upload...' : 'Upload Fichiers'}
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {medias.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Aucun média trouvé</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          medias.map((media) => (
            <Card key={media.id} className="overflow-hidden">
              <CardHeader className="p-3">
                <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                  {media.mime_type?.startsWith('image/') ? (
                    <img
                      src={getMediaUrl(media.file_path)}
                      alt={media.alt_text || media.original_filename}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => openMediaDetail(media)}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                      onClick={() => openMediaDetail(media)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📄</div>
                        <div className="text-xs text-muted-foreground">
                          {media.mime_type || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <CardTitle className="text-sm line-clamp-2" title={media.original_filename}>
                  {media.original_filename}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{formatFileSize(media.file_size)}</span>
                  {media.width && media.height && (
                    <span>{media.width}×{media.height}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMediaDetail(media)}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(media.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails du média</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={selectedMedia.alt_text || selectedMedia.original_filename}
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📄</div>
                        <p className="text-muted-foreground">Aperçu non disponible</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nom du fichier</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedia.original_filename}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Type MIME</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedia.mime_type || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Taille</Label>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedMedia.file_size)}</p>
                  </div>
                  
                  {selectedMedia.width && selectedMedia.height && (
                    <div>
                      <Label className="text-sm font-medium">Dimensions</Label>
                      <p className="text-sm text-muted-foreground">{selectedMedia.width} × {selectedMedia.height} px</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium">Date d'upload</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedMedia.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="alt-text" className="text-sm font-medium">Texte alternatif</Label>
                    <Input
                      id="alt-text"
                      value={selectedMedia.alt_text || ''}
                      onChange={(e) => {
                        setSelectedMedia(prev => prev ? { ...prev, alt_text: e.target.value } : null);
                      }}
                      onBlur={(e) => updateMediaAltText(selectedMedia.id, e.target.value)}
                      placeholder="Description de l'image pour l'accessibilité"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        const url = getMediaUrl(selectedMedia.file_path);
                        window.open(url, '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(getMediaUrl(selectedMedia.file_path));
                        toast({
                          title: "Succès",
                          description: "URL copiée dans le presse-papier",
                        });
                      }}
                    >
                      Copier URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible et le fichier sera définitivement supprimé.
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