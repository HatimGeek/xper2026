import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContacts, useUpdateContact } from "@/hooks/useSupabaseQuery";
import { Phone, Mail, MessageCircle, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export const ContactsManagementSection = () => {
  const { data: contacts = [], isLoading } = useContacts();
  const updateContact = useUpdateContact();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
      case "contacted":
        return <Badge className="gap-1 bg-blue-500"><MessageCircle className="w-3 h-3" />Contacté</Badge>;
      case "completed":
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Terminé</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateContact.mutateAsync({
        id,
        updates: { 
          status,
          responded_at: status === "contacted" ? new Date().toISOString() : undefined
        }
      });
      toast.success("Statut mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Bonjour ${name}, suite à votre demande de devis...`);
    window.open(`https://wa.me/${phone.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  const openEmail = (email: string, name: string) => {
    const subject = encodeURIComponent('Réponse à votre demande de devis');
    const body = encodeURIComponent(`Bonjour ${name},\n\nSuite à votre demande de devis...\n\nCordialement`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const viewDetails = (contact: any) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact & Devis</h2>
        <Badge variant="secondary">{contacts.length} demande(s)</Badge>
      </div>

      <div className="grid gap-4">
        {contacts.map((contact: any) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <div className="flex gap-2 text-sm text-muted-foreground">
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
                  </div>
                  {contact.sectors?.name && (
                    <Badge variant="outline">{contact.sectors.name}</Badge>
                  )}
                  {contact.services?.title && (
                    <Badge variant="outline">{contact.services.title}</Badge>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(contact.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(contact.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 line-clamp-2">{contact.message}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => viewDetails(contact)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Voir détails
                </Button>
                {contact.phone && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => openWhatsApp(contact.phone, contact.name)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openEmail(contact.email, contact.name)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                {contact.status === "pending" && (
                  <Button 
                    size="sm" 
                    onClick={() => updateStatus(contact.id, "contacted")}
                  >
                    Marquer contacté
                  </Button>
                )}
                {contact.status === "contacted" && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => updateStatus(contact.id, "completed")}
                  >
                    Marquer terminé
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {contacts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune demande de contact pour le moment
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Informations client</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nom:</span> {selectedContact.name}</div>
                  <div><span className="font-medium">Email:</span> {selectedContact.email}</div>
                  <div><span className="font-medium">Téléphone:</span> {selectedContact.phone || "Non fourni"}</div>
                  <div><span className="font-medium">Date:</span> {new Date(selectedContact.created_at).toLocaleString('fr-FR')}</div>
                </div>
              </div>
              {(selectedContact.sectors || selectedContact.services) && (
                <div>
                  <h3 className="font-semibold mb-2">Secteur/Service</h3>
                  <div className="flex gap-2">
                    {selectedContact.sectors && <Badge>{selectedContact.sectors.name}</Badge>}
                    {selectedContact.services && <Badge variant="outline">{selectedContact.services.title}</Badge>}
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Message</h3>
                <p className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                {selectedContact.phone && (
                  <Button 
                    className="flex-1"
                    onClick={() => openWhatsApp(selectedContact.phone, selectedContact.name)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Répondre via WhatsApp
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => openEmail(selectedContact.email, selectedContact.name)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Répondre par Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
