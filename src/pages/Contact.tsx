import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Send,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCreateContact } from "@/hooks/useSupabaseQuery";
import { toast as sonnerToast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const createContact = useCreateContact();

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Téléphone",
      details: ["+212 661 367 041", "Appel direct"],
      action: "tel:+212661367041"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "WhatsApp",
      details: ["+212 663 183 984", "Réponse rapide"],
      action: "https://wa.me/212663183984"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: ["xpercuir@gmail.com", "Réponse sous 24h"],
      action: "mailto:xpercuir@gmail.com"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Localisation",
      details: ["Voir sur", "Google Maps"],
      action: "https://maps.app.goo.gl/ZbsF7HFjcYDHtxpX7"
    }
  ];

  const services = [
    "Réparation siège auto",
    "Coloration cuir", 
    "Restauration meubles",
    "Services commerciaux",
    "Secteur aviation",
    "Secteur santé",
    "Autre"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createContact.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim(),
        status: 'pending'
      });

      sonnerToast.success("Message envoyé !", {
        description: "Nous vous répondrons dans les plus brefs délais."
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: ""
      });
    } catch (error: any) {
      console.error("Error submitting contact:", error);
      sonnerToast.error("Erreur lors de l'envoi", {
        description: "Veuillez réessayer ou nous contacter directement."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-smooth">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Une question ? Un projet de restauration ? Notre équipe d'experts est à votre disposition 
              pour vous conseiller et établir un devis gratuit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulaire de contact */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl">Demande de devis gratuit</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet *</label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone</label>
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Service souhaité</label>
                      <select 
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Sélectionnez un service</option>
                        {services.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <Textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet, le type de cuir, les dommages observés, vos attentes..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-leather"
                    disabled={isSubmitting}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    * Champs obligatoires - Réponse garantie sous 24h
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <a 
                    key={index} 
                    href={info.action}
                    target={info.action.startsWith('http') ? '_blank' : undefined}
                    rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <Card className="hover:shadow-leather transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-gradient-leather text-primary-foreground rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            {info.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{info.title}</h3>
                            {info.details.map((detail, detailIndex) => (
                              <p key={detailIndex} className={`text-sm ${detailIndex === 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              {/* Horaires */}
              <Card className="shadow-leather">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Horaires d'ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Lundi - Samedi:</span>
                      <span className="font-medium">9h00 - 19h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche:</span>
                      <span className="text-muted-foreground">Fermé</span>
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground mt-4">
                    🚨 Interventions d'urgence possibles
                  </Badge>
                </CardContent>
              </Card>

              {/* Réseaux sociaux */}
              <Card>
                <CardHeader>
                  <CardTitle>Suivez-nous</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <a href="https://www.facebook.com/Xpercuirmultiservice" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-leather text-primary-foreground rounded-lg hover:shadow-gold transition-all">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="https://www.instagram.com/xpercuir.ma_multiservice" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-leather text-primary-foreground rounded-lg hover:shadow-gold transition-all">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="https://www.linkedin.com/in/xpercuir-multiservices-a6a273130" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-leather text-primary-foreground rounded-lg hover:shadow-gold transition-all">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Découvrez nos dernières réalisations et conseils d'entretien
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-16">
            <Card className="overflow-hidden">
              <div className="h-64 bg-gradient-warm flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-2">Notre Localisation</h3>
                  <p className="text-muted-foreground">Cliquez pour voir notre position sur Google Maps</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href="https://maps.app.goo.gl/ZbsF7HFjcYDHtxpX7" target="_blank" rel="noopener noreferrer">
                      Voir sur Google Maps
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;