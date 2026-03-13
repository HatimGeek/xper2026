import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-leather text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Xpercuir Pro Logo" className="h-10 w-auto" />
              <div>
                <h3 className="text-lg font-bold">Xpercuir Pro</h3>
                <p className="text-xs opacity-80">Expertise du cuir</p>
              </div>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Spécialisés dans la réparation, l'entretien et la restauration du cuir haut de gamme depuis plus de 15 ans.
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/Xpercuirmultiservice" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-smooth">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/xpercuir.ma_multiservice" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-smooth">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/xpercuir-multiservices-a6a273130" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-smooth">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Nos Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/reparation-siege-auto" className="opacity-90 hover:opacity-100 transition-smooth">Réparation siège auto</Link></li>
              <li><Link to="/coloration-cuir" className="opacity-90 hover:opacity-100 transition-smooth">Coloration du cuir</Link></li>
              <li><Link to="/meubles-cuir" className="opacity-90 hover:opacity-100 transition-smooth">Restauration meubles</Link></li>
              <li><Link to="/services-commerciaux" className="opacity-90 hover:opacity-100 transition-smooth">Services commerciaux</Link></li>
              <li><Link to="/aviation" className="opacity-90 hover:opacity-100 transition-smooth">Secteur aviation</Link></li>
              <li><Link to="/secteur-sante" className="opacity-90 hover:opacity-100 transition-smooth">Secteur santé</Link></li>
              <li><Link to="/tapissier" className="opacity-90 hover:opacity-100 transition-smooth">Tapissier</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 opacity-80" />
                <a href="https://maps.app.goo.gl/ZbsF7HFjcYDHtxpX7" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-smooth">
                  <p>Voir sur Google Maps</p>
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 opacity-80" />
                <a href="tel:+212661367041" className="hover:opacity-100 transition-smooth">+212 661 367 041</a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 opacity-80" />
                <a href="https://wa.me/212663183984" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-smooth">+212 663 183 984 (WhatsApp)</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 opacity-80" />
                <a href="mailto:xpercuir@gmail.com" className="hover:opacity-100 transition-smooth">xpercuir@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Horaires d'ouverture</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 opacity-80" />
                <div>
                  <p><strong>Lun - Sam:</strong> 9h00 - 19h00</p>
                  <p><strong>Dim:</strong> Fermé</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-80">
          <p>&copy; 2024 Xpercuir Pro. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/mentions-legales" className="hover:opacity-100 transition-smooth">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:opacity-100 transition-smooth">Politique de confidentialité</Link>
            <Link to="/cgv" className="hover:opacity-100 transition-smooth">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;