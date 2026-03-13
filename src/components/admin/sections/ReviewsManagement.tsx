import { useState } from 'react';
import { Check, X, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useReviews, useUpdateReview } from '@/hooks/useSupabaseQuery';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPublicMediaUrl } from '@/lib/utils';

// Component to display photos
const PhotoDisplay = ({ photoId }: { photoId: string }) => {
  const { data: photo } = useQuery({
    queryKey: ['review-photo', photoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', photoId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (!photo) return null;

  return (
    <img 
      src={getPublicMediaUrl(photo.file_path)} 
      alt={photo.alt_text || 'Photo avis'}
      className="w-20 h-20 object-cover rounded-lg"
    />
  );
};

interface Review {
  id: string;
  client_name: string;
  client_email: string | null;
  message: string;
  rating: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  admin_response: string | null;
  responded_at: string | null;
  responded_by: string | null;
  service_id: string | null;
  sector_id: string | null;
  created_at: string;
  updated_at: string;
  sectors?: { name: string };
  services?: { title: string };
}

export const ReviewsManagement = () => {
  const { data: reviews = [], isLoading: loading } = useReviews();
  const updateReview = useUpdateReview();
  
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const { toast } = useToast();

  const handleReviewAction = async (reviewId: string, status: 'approved' | 'rejected', response?: string) => {
    try {
      await updateReview.mutateAsync({
        id: reviewId,
        updates: {
          status,
          admin_response: response || null,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });

      toast({
        title: "Succès",
        description: `Avis ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`,
      });

      setIsResponseDialogOpen(false);
      setSelectedReview(null);
      setAdminResponse('');
      setActionType(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openResponseDialog = (review: Review, type: 'approved' | 'rejected') => {
    setSelectedReview(review);
    setActionType(type);
    setAdminResponse(review.admin_response || '');
    setIsResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (selectedReview && actionType) {
      handleReviewAction(selectedReview.id, actionType, adminResponse);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading">Gestion des Avis</h2>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Aucun avis trouvé</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {review.client_name}
                      {getStatusBadge(review.status)}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                      {review.client_email && <span>{review.client_email}</span>}
                      {review.sectors && <span>Secteur: {review.sectors.name}</span>}
                      {review.services && <span>Service: {review.services.title}</span>}
                    </div>
                    {review.rating && (
                      <div className="mt-2">
                        {renderStars(review.rating)}
                      </div>
                    )}
                  </div>
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResponseDialog(review as Review, 'approved')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResponseDialog(review as Review, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Message du client:</p>
                    <p className="text-sm">{review.message}</p>
                  </div>
                  
                  {review.admin_response && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Réponse admin:</p>
                      <p className="text-sm">{review.admin_response}</p>
                      {review.responded_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Répondu le {new Date(review.responded_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  )}

                  {review.photos && review.photos.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Photos jointes:</p>
                      <div className="flex gap-2 flex-wrap">
                        {review.photos.map((photoId, idx) => (
                          <PhotoDisplay key={idx} photoId={photoId} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'Approuver l\'avis' : 'Rejeter l\'avis'}
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Avis de {selectedReview.client_name}:</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedReview.message}</p>
                {selectedReview.rating && (
                  <div className="mt-2">
                    {renderStars(selectedReview.rating)}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="admin_response">
                  Réponse administrative {actionType === 'rejected' ? '(obligatoire)' : '(optionnelle)'}
                </Label>
                <Textarea
                  id="admin_response"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder={actionType === 'approved' 
                    ? "Merci pour votre retour positif..." 
                    : "Raison du rejet de l'avis..."
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmitResponse}
                  disabled={actionType === 'rejected' && !adminResponse.trim()}
                  className={actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {actionType === 'approved' ? 'Approuver' : 'Rejeter'}
                </Button>
                <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};