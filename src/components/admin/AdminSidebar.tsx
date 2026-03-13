import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FolderOpen,
  Image,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  Users,
  Mail,
  Shield,
  Database,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    id: 'dashboard',
    roles: ['admin', 'editor', 'moderator'],
  },
  {
    title: 'Secteurs & Services',
    icon: FolderOpen,
    id: 'sectors',
    roles: ['admin', 'editor'],
  },
  {
    title: 'Médias & Avant/Après',
    icon: Image,
    id: 'media',
    roles: ['admin', 'editor', 'moderator'],
  },
  {
    title: 'Galerie Secteurs',
    icon: Image,
    id: 'sector-media',
    roles: ['admin', 'editor', 'moderator'],
  },
  {
    title: 'Avis Clients',
    icon: MessageSquare,
    id: 'reviews',
    roles: ['admin', 'moderator'],
  },
  {
    title: 'Pages & Contenu',
    icon: FileText,
    id: 'pages',
    roles: ['admin', 'editor'],
  },
  {
    title: 'Contact & Devis',
    icon: Mail,
    id: 'contact',
    roles: ['admin', 'editor', 'moderator'],
  },
  {
    title: 'Logos Clients',
    icon: Database,
    id: 'clients',
    roles: ['admin', 'editor'],
  },
  {
    title: 'Marketplace',
    icon: Database,
    id: 'marketplace',
    roles: ['admin', 'editor'],
  },
  {
    title: 'Utilisateurs',
    icon: Users,
    id: 'users',
    roles: ['admin'],
  },
  {
    title: 'Journaux',
    icon: BarChart3,
    id: 'logs',
    roles: ['admin'],
  },
  {
    title: 'Paramètres',
    icon: Settings,
    id: 'settings',
    roles: ['admin'],
  },
];

interface AdminSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const AdminSidebar = ({ 
  activeSection = 'dashboard', 
  onSectionChange 
}: AdminSidebarProps) => {
  const { state } = useSidebar();
  const { hasRole } = useAuth();
  const [currentSection, setCurrentSection] = useState(activeSection);

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
    onSectionChange?.(sectionId);
  };

  const filteredMenuItems = menuItems.filter(item => 
    hasRole(item.roles as any)
  );

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {state !== "collapsed" && (
              <span className="font-heading font-bold text-lg">Admin</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => handleSectionChange(item.id)}
                    className={
                      currentSection === item.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};