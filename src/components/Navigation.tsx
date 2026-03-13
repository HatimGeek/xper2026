import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, MessageCircle, Shield, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();

  const menuStructure = [
    {
      title: "Entretien de Cuir",
      items: [
        { href: "/reparation-siege-auto", label: "Siège Auto" },
        { href: "/meubles-cuir", label: "Meubles Cuir" },
      ],
    },
    {
      title: "Tapisserie",
      items: [
        { href: "/tapissier", label: "Salons" },
        { href: "/tetes-de-lit", label: "Têtes de lit" },
      ],
    },
    {
      title: "Commercial",
      items: [
        { href: "/services-commerciaux", label: "Entreprise" },
        { href: "/aviation", label: "Aviation" },
        { href: "/secteur-sante", label: "Santé" },
        { href: "/marine", label: "Marine" },
      ],
    },
  ];

  const singleItems = [
    { href: "/coloration-cuir", label: "Coloration" },
    { href: "/marketplace", label: "Achat et Vente" },
    { href: "/avis-clients", label: "Avis" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const canAccessAdmin = isAdmin();

  const toggleMobileSubmenu = (title: string) => {
    setOpenMobileMenu(openMobileMenu === title ? null : title);
  };

  return (
    <nav className="bg-card/90 backdrop-blur-md shadow-elegant sticky top-0 z-50 border-b border-border text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-4 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Xpercuir Pro Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-primary">Xpercuir Pro</h1>
              <p className="text-xs text-muted-foreground">Expertise du cuir</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                isActive("/")
                  ? "bg-accent text-accent-foreground"
                  : "text-white hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              Accueil
            </Link>

            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {menuStructure.map((menu) => (
                  <NavigationMenuItem key={menu.title} className="relative">
                    <NavigationMenuTrigger className="text-sm font-medium bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground text-white">
                      {menu.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full z-50">
                        <ul className="grid gap-1 p-2 bg-card border border-border rounded-md shadow-elegant text-center whitespace-nowrap">
                          {menu.items.map((item) => (
                            <li key={item.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.href}
                                  className={`block select-none rounded-md px-4 py-3 leading-none no-underline outline-none transition-smooth hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                    isActive(item.href) ? "bg-accent text-accent-foreground" : "text-white"
                                  }`}
                                >
                                  <div className="text-sm font-medium leading-none">{item.label}</div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {singleItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-white hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-2">
            {user ? (
              <>
                {canAccessAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Se connecter</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 animate-fade-in-up">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActive("/")
                    ? "bg-accent text-accent-foreground"
                    : "text-white hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                Accueil
              </Link>

              {menuStructure.map((menu) => (
                <div key={menu.title}>
                  <button
                    onClick={() => toggleMobileSubmenu(menu.title)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-accent hover:text-accent-foreground transition-smooth"
                  >
                    <span>{menu.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openMobileMenu === menu.title ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openMobileMenu === menu.title && (
                    <div className="ml-4 mt-2 space-y-2">
                      {menu.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground"
                              : "text-white hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {singleItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-white hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    {canAccessAdmin && (
                      <Button variant="outline" size="sm" className="justify-start" asChild>
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin
                        </Link>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Se connecter
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <a href="tel:+212661367041">
                    <Phone className="w-4 h-4 mr-2" />
                    +212 661 367 041
                  </a>
                </Button>
                <Button variant="default" size="sm" className="justify-start bg-gradient-leather" asChild>
                  <a href="https://wa.me/212663183984" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
