export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(item => 
      headers.map(header => {
        const value = item[header];
        // Handle null/undefined values
        if (value === null || value === undefined) return '';
        // Handle arrays and objects
        if (typeof value === 'object') return JSON.stringify(value);
        // Handle strings with commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatDataForExport = (data: any[], type: string) => {
  const currentDate = new Date().toLocaleString('fr-FR');
  
  switch (type) {
    case 'sectors':
      return data.map(item => ({
        'ID': item.id,
        'Nom': item.name,
        'Slug': item.slug,
        'Description': item.description || '',
        'Icône': item.icon || '',
        'Ordre': item.display_order || 0,
        'Actif': item.is_active ? 'Oui' : 'Non',
        'Créé le': new Date(item.created_at).toLocaleString('fr-FR'),
        'Modifié le': new Date(item.updated_at).toLocaleString('fr-FR'),
      }));
    
    case 'services':
      return data.map(item => ({
        'ID': item.id,
        'Titre': item.title,
        'Slug': item.slug,
        'Description': item.description || '',
        'Description courte': item.short_description || '',
        'Gamme de prix': item.price_range || '',
        'Secteur': item.sectors?.name || '',
        'Statut': item.status,
        'Ordre': item.display_order || 0,
        'Créé le': new Date(item.created_at).toLocaleString('fr-FR'),
        'Modifié le': new Date(item.updated_at).toLocaleString('fr-FR'),
      }));
    
    case 'reviews':
      return data.map(item => ({
        'ID': item.id,
        'Nom du client': item.client_name,
        'Email': item.client_email || '',
        'Note': item.rating || '',
        'Message': item.message,
        'Statut': item.status,
        'Secteur': item.sectors?.name || '',
        'Service': item.services?.title || '',
        'Réponse admin': item.admin_response || '',
        'Créé le': new Date(item.created_at).toLocaleString('fr-FR'),
        'Répondu le': item.responded_at ? new Date(item.responded_at).toLocaleString('fr-FR') : '',
      }));
    
    case 'contacts':
      return data.map(item => ({
        'ID': item.id,
        'Nom': item.name,
        'Email': item.email,
        'Téléphone': item.phone || '',
        'Message': item.message,
        'Statut': item.status,
        'Secteur': item.sectors?.name || '',
        'Service': item.services?.title || '',
        'Assigné à': item.assigned_to || '',
        'Créé le': new Date(item.created_at).toLocaleString('fr-FR'),
        'Répondu le': item.responded_at ? new Date(item.responded_at).toLocaleString('fr-FR') : '',
      }));
    
    case 'media':
      return data.map(item => ({
        'ID': item.id,
        'Nom du fichier': item.filename,
        'Nom original': item.original_filename,
        'Chemin': item.file_path,
        'Type MIME': item.mime_type || '',
        'Taille': item.file_size || 0,
        'Largeur': item.width || '',
        'Hauteur': item.height || '',
        'Texte alt': item.alt_text || '',
        'Tags': Array.isArray(item.tags) ? item.tags.join(', ') : '',
        'Uploadé le': new Date(item.created_at).toLocaleString('fr-FR'),
      }));
    
    case 'pages':
      return data.map(item => ({
        'ID': item.id,
        'Titre': item.title,
        'Slug': item.slug,
        'Statut': item.status,
        'Titre SEO': item.meta_title || '',
        'Description SEO': item.meta_description || '',
        'Visible': item.is_visible ? 'Oui' : 'Non',
        'Créé le': new Date(item.created_at).toLocaleString('fr-FR'),
        'Modifié le': new Date(item.updated_at).toLocaleString('fr-FR'),
      }));
    
    case 'media-pairs':
      return data.map(item => ({
        'ID': item.id,
        'Titre': item.title,
        'Description': item.description || '',
        'Statut': item.status,
        'Consentement': item.client_consent ? 'Oui' : 'Non',
        'Secteur': item.sectors?.name || '',
        'Service': item.services?.title || '',
        'Créé le': new Date(item.created_at).toLocaleString('fr-FR'),
        'Modifié le': new Date(item.updated_at).toLocaleString('fr-FR'),
      }));
    
    default:
      return data;
  }
};