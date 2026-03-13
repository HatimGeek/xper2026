import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logo from '@/assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Bell, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const AdminHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'editor':
        return 'bg-primary text-primary-foreground';
      case 'moderator':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getUserInitials = () => {
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <img src={logo} alt="Xpercuir Pro Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-heading font-semibold">
              Administration Xpercuir Pro
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Retour au site</span>
          </Button>

          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.email}
                  </span>
                  {user?.app_metadata?.role && (
                    <Badge 
                      className={`text-xs ${getRoleColor(user.app_metadata.role)}`}
                      variant="secondary"
                    >
                      {user.app_metadata.role}
                    </Badge>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};