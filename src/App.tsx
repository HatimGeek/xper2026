import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ReparationSiegeAuto from "./pages/ReparationSiegeAuto";
import ColorationCuir from "./pages/ColorationCuir";
import MeublesCuir from "./pages/MeublesCuir";
import ServicesCommerciaux from "./pages/ServicesCommerciaux";
import Aviation from "./pages/Aviation";
import SecteurSante from "./pages/SecteurSante";
import Tapissier from "./pages/Tapissier";
import TetesdeLit from "./pages/TetesdeLit";
import Marine from "./pages/Marine";
import AvisClients from "./pages/AvisClients";
import AvantApres from "./pages/AvantApres";
import Contact from "./pages/Contact";
import Marketplace from "./pages/Marketplace";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin Routes - No Navigation/Footer */}
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            
            {/* Public Routes - With Navigation/Footer */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/reparation-siege-auto" element={<ReparationSiegeAuto />} />
                    <Route path="/coloration-cuir" element={<ColorationCuir />} />
                    <Route path="/meubles-cuir" element={<MeublesCuir />} />
                    <Route path="/services-commerciaux" element={<ServicesCommerciaux />} />
                    <Route path="/aviation" element={<Aviation />} />
                    <Route path="/secteur-sante" element={<SecteurSante />} />
                    <Route path="/tapissier" element={<Tapissier />} />
                    <Route path="/tetes-de-lit" element={<TetesdeLit />} />
                    <Route path="/marine" element={<Marine />} />
                    <Route path="/avis-clients" element={<AvisClients />} />
                    <Route path="/avant-apres" element={<AvantApres />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
