import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminDashboard } from './AdminDashboard';
import { SectorsManagement } from './sections/SectorsManagement';
import { ServicesManagement } from './sections/ServicesManagement';
import { ReviewsManagement } from './sections/ReviewsManagement';
import { ContactsManagement } from './sections/ContactsManagement';
import { MediaManagement } from './sections/MediaManagement';
import { PagesManagement } from './sections/PagesManagement';
import { MediaPairsManagement } from './sections/MediaPairsManagement';
import { SectorMediaManagement } from './sections/SectorMediaManagement';
import { ContactsManagementSection } from './sections/ContactsManagementSection';
import { UsersManagementSection } from './sections/UsersManagementSection';
import { LogsSection } from './sections/LogsSection';
import { SettingsSection } from './sections/SettingsSection';
import { ClientsManagement } from './sections/ClientsManagement';
import MarketplaceManagement from './sections/MarketplaceManagement';

export const AdminLayout = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'sectors':
        return <SectorsManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'reviews':
        return <ReviewsManagement />;
      case 'contacts':
        return <ContactsManagement />;
      case 'media':
        return <MediaManagement />;
      case 'pages':
        return <PagesManagement />;
      case 'media-pairs':
      case 'before-after':
        return <MediaPairsManagement />;
      case 'sector-media':
        return <SectorMediaManagement />;
      case 'contact':
        return <ContactsManagementSection />;
      case 'clients':
        return <ClientsManagement />;
      case 'marketplace':
        return <MarketplaceManagement />;
      case 'users':
        return <UsersManagementSection />;
      case 'logs':
        return <LogsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <AdminDashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 bg-background">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};