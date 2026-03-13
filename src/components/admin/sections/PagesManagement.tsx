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
import { Plus, Edit2, Trash2, FileText, Eye, EyeOff, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';

interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  status: 'draft' | 'published' | 'archived';
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const PagesManagement = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_visible: true,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      const pagesData = (data || []).map(page => ({
        ...page,
        status: page.status as Page['status'],
      }));
      setPages(pagesData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les pages: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
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
      slug: name === 'title' ? generateSlug(value) : prev.slug,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      meta_title: '',
      meta_description: '',
      status: 'draft',
      is_visible: true,
    });
    setEditingPage(null);
    setActiveTab('content');
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      status: page.status,
      is_visible: page.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPage) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update({
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            status: formData.status,
            is_visible: formData.is_visible,
          })
          .eq('id', editingPage.id);

        if (error) throw error;

        toast({
          title: "Page modifiée",
          description: "La page a été modifiée avec succès.",
        });
      } else {
        // Create new page
        const { error } = await supabase
          .from('pages')
          .insert({
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            status: formData.status,
            is_visible: formData.is_visible,
          });

        if (error) throw error;

        toast({
          title: "Page créée",
          description: "La page a été créée avec succès.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPages();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const handleDelete = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast({
        title: "Page supprimée",
        description: "La page a été supprimée avec succès.",
      });

      fetchPages();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const togglePublished = async (page: Page) => {
    try {
      const newStatus = page.status === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('pages')
        .update({ status: newStatus })
        .eq('id', page.id);

      if (error) throw error;

      toast({
        title: newStatus === 'published' ? "Page publiée" : "Page mise en brouillon",
        description: `La page a été ${newStatus === 'published' ? 'publiée' : 'mise en brouillon'} avec succès.`,
      });

      fetchPages();
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
        return <Badge className="bg-green-100 text-green-800">Publiée</Badge>;
      default:
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold">Gestion des Pages</h2>
            <p className="text-muted-foreground">Créez et gérez les pages de votre site</p>
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
          <h2 className="text-2xl font-heading font-bold">Gestion des Pages</h2>
          <p className="text-muted-foreground">Créez et gérez les pages de votre site</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              const formattedData = formatDataForExport(pages, 'pages');
              exportToCSV(formattedData, 'pages');
              toast({
                title: "Export réussi",
                description: "Les pages ont été exportées en CSV.",
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
                Nouvelle Page
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Modifier la page' : 'Créer une nouvelle page'}
              </DialogTitle>
              <DialogDescription>
                {editingPage 
                  ? 'Modifiez les informations de la page ci-dessous.'
                  : 'Créez une nouvelle page pour votre site.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de la page</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="ex: À propos"
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
                      placeholder="a-propos"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Contenu (Markdown)</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Écrivez le contenu en Markdown..."
                      rows={12}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="seo" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Titre SEO</Label>
                    <Input
                      id="meta_title"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      placeholder="Titre optimisé pour les moteurs de recherche"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Description SEO</Label>
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      placeholder="Description pour les moteurs de recherche (max 160 caractères)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_description.length}/160 caractères
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publiée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                    />
                    <Label htmlFor="is_visible">Page visible dans la navigation</Label>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingPage ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {pages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucune page trouvée. Créez votre première page.
              </p>
            </CardContent>
          </Card>
        ) : (
          pages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {page.title}
                      {getStatusBadge(page.status)}
                      {!page.is_visible && (
                        <Badge variant="outline" className="text-xs">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Masqué
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      /{page.slug}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modifié le {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(page)}
                    >
                      {page.status === 'published' ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
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
                          <AlertDialogTitle>Supprimer la page</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la page "{page.title}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(page.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {page.content && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {page.content.substring(0, 200)}...
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};