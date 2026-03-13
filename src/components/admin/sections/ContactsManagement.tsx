import { useState } from 'react';
import { Mail, Phone, Eye, Check, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';
import { useContacts, useUpdateContact } from '@/hooks/useSupabaseQuery';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  service_id: string | null;
  sector_id: string | null;
  assigned_to: string | null;
  responded_at: string | null;
  created_at: string;
  sectors?: { name: string };
  services?: { title: string };
}

export const ContactsManagement = () => {
  const { data: contacts = [], isLoading: loading } = useContacts();
  const updateContact = useUpdateContact();
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const updateContactStatus = async (contactId: string, newStatus: string) => {
    try {
      await updateContact.mutateAsync({
        id: contactId,
        updates: {
          status: newStatus,
          responded_at: newStatus !== 'pending' ? new Date().toISOString() : null
        }
      });

      toast({
        title: "Succès",
        description: `Statut mis à jour`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'responded':
        return <Badge className="bg-green-100 text-green-800">Traité</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const openDetailDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailDialogOpen(true);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading">Gestion des Contacts</h2>
      </div>

      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Aucun contact trouvé</p>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {contact.name}
                      {getStatusBadge(contact.status)}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </span>
                      )}
                      <span>{new Date(contact.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {contact.sectors && <span>Secteur: {contact.sectors.name}</span>}
                      {contact.services && <span> • Service: {contact.services.title}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailDialog(contact)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    {contact.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateContactStatus(contact.id, 'in_progress')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateContactStatus(contact.id, 'rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message:</p>
                  <p className="text-sm line-clamp-3">{contact.message}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande de contact</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom</Label>
                  <p className="text-sm text-muted-foreground">{selectedContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    <p className="text-sm text-muted-foreground">{selectedContact.phone}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedContact.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {(selectedContact.sectors || selectedContact.services) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedContact.sectors && (
                    <div>
                      <Label className="text-sm font-medium">Secteur</Label>
                      <p className="text-sm text-muted-foreground">{selectedContact.sectors.name}</p>
                    </div>
                  )}
                  {selectedContact.services && (
                    <div>
                      <Label className="text-sm font-medium">Service</Label>
                      <p className="text-sm text-muted-foreground">{selectedContact.services.title}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Statut</Label>
                <div className="mt-2">
                  <Select 
                    value={selectedContact.status} 
                    onValueChange={(value) => {
                      updateContactStatus(selectedContact.id, value);
                      setSelectedContact(prev => prev ? { ...prev, status: value } : null);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="responded">Traité</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedContact.responded_at && (
                <div>
                  <Label className="text-sm font-medium">Traité le</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedContact.responded_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => window.open(`mailto:${selectedContact.email}?subject=Re: ${selectedContact.name}&body=Bonjour ${selectedContact.name},%0D%0A%0D%0ANous avons bien reçu votre demande concernant...`)}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Répondre par email
                </Button>
                {selectedContact.phone && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`tel:${selectedContact.phone}`)}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};