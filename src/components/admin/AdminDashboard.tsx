import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  MessageSquare,
  Image,
  FolderOpen,
  Mail,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface DashboardStats {
  pendingReviews: number;
  pendingBeforeAfter: number;
  totalSectors: number;
  totalServices: number;
  pendingContacts: number;
  totalMedia: number;
  totalPages: number;
}

interface AdminDashboardProps {
  onNavigate: (section: string) => void;
}

export const AdminDashboard = ({ onNavigate }: AdminDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    pendingReviews: 0,
    pendingBeforeAfter: 0,
    totalSectors: 0,
    totalServices: 0,
    pendingContacts: 0,
    totalMedia: 0,
    totalPages: 0,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch stats in parallel
      const [
        { count: pendingReviews },
        { count: pendingBeforeAfter },
        { count: totalSectors },
        { count: totalServices },
        { count: pendingContacts },
        { count: totalMedia },
        { count: totalPages },
      ] = await Promise.all([
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('media_pairs').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('sectors').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('media').select('*', { count: 'exact', head: true }),
        supabase.from('pages').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        pendingReviews: pendingReviews || 0,
        pendingBeforeAfter: pendingBeforeAfter || 0,
        totalSectors: totalSectors || 0,
        totalServices: totalServices || 0,
        pendingContacts: pendingContacts || 0,
        totalMedia: totalMedia || 0,
        totalPages: totalPages || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Avis en attente',
      value: stats.pendingReviews,
      icon: MessageSquare,
      description: 'Avis clients à modérer',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      onClick: () => onNavigate('reviews'),
    },
    {
      title: 'Avant/Après en attente',
      value: stats.pendingBeforeAfter,
      icon: Image,
      description: 'Photos à valider',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => onNavigate('media-pairs'),
    },
    {
      title: 'Secteurs',
      value: stats.totalSectors,
      icon: FolderOpen,
      description: 'Secteurs d\'activité',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => onNavigate('sectors'),
    },
    {
      title: 'Services',
      value: stats.totalServices,
      icon: TrendingUp,
      description: 'Services proposés',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => onNavigate('services'),
    },
    {
      title: 'Demandes contact',
      value: stats.pendingContacts,
      icon: Mail,
      description: 'Messages non traités',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => onNavigate('contacts'),
    },
    {
      title: 'Médias',
      value: stats.totalMedia,
      icon: Image,
      description: 'Fichiers uploadés',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => onNavigate('media'),
    },
    {
      title: 'Pages',
      value: stats.totalPages,
      icon: FileText,
      description: 'Pages du site',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      onClick: () => onNavigate('pages'),
    },
  ];

  const quickActions = [
    {
      title: 'Ajouter Avant/Après',
      description: 'Uploader de nouvelles photos',
      icon: Plus,
      action: () => onNavigate('media-pairs'),
    },
    {
      title: 'Valider Avis',
      description: 'Modérer les avis clients',
      icon: CheckCircle,
      action: () => onNavigate('reviews'),
    },
    {
      title: 'Créer Secteur',
      description: 'Nouveau secteur d\'activité',
      icon: FolderOpen,
      action: () => onNavigate('sectors'),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight">
          Tableau de bord
        </h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre site Xpercuir Pro
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card 
            key={card.title} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Raccourcis pour les tâches courantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={action.action}
                >
                  <action.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Nouvel avis reçu</p>
                  <p className="text-muted-foreground text-xs">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Photos uploadées</p>
                  <p className="text-muted-foreground text-xs">Il y a 4 heures</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Service créé</p>
                  <p className="text-muted-foreground text-xs">Hier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};