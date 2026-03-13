import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Review {
  client_name: string;
  message: string;
  rating: number;
  status: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Supprimer tous les avis existants
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (deleteError) {
      console.error('Error deleting reviews:', deleteError)
      throw deleteError
    }

    // 2. Insérer les nouveaux avis avec dates relatives exactes
    const now = new Date()
    const getDateFromRelative = (relative: string): string => {
      const match = relative.match(/il y a (\d+) (mois|an|ans)/)
      if (!match) {
        // Cas spécial "Modifié il y a un an"
        if (relative.includes('un an') || relative.includes('1 an')) {
          const date = new Date(now)
          date.setFullYear(date.getFullYear() - 1)
          return date.toISOString()
        }
        if (relative.includes('un mois') || relative.includes('1 mois')) {
          const date = new Date(now)
          date.setMonth(date.getMonth() - 1)
          return date.toISOString()
        }
        return now.toISOString()
      }
      
      const amount = parseInt(match[1])
      const unit = match[2]
      const date = new Date(now)
      
      if (unit === 'mois') {
        date.setMonth(date.getMonth() - amount)
      } else {
        date.setFullYear(date.getFullYear() - amount)
      }
      
      return date.toISOString()
    }

    const newReviews: Review[] = [
      { client_name: "Juls Mens", message: "J'ai fait réparer le cuir du tableau de bord et rénover mon volant, impeccable 👌🏻 ! Des personnes gentilles, professionnelles, un très bon résultat ! Merci je recommande.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 mois") },
      { client_name: "Anouar Ghrib", message: "Un service et un résultat exceptionnels ! Un vrai professionnel du cuir et du plastique, pour voiture ou mobilier. Résultat époustouflant 🥰 Je recommande vivement !", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 mois") },
      { client_name: "Youssef M", message: "Très content du résultat sur le volant de ma BMW, rapide, efficace et professionnel, je recommande vivement.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 6 mois") },
      { client_name: "Soufiane AZAMI HASSANI", message: "Travail propre, je recommande", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 5 mois") },
      { client_name: "Ceasar Polar", message: "Excellent service, je recommande fortement, mon volant est comme neuf, ils utilisent de la teinte cuire donc tout redeviens comme neuf. Voire les photos et jugez de vous même!", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "ramon cavero", message: "Après quelques recherches sur le net.. j'ai opté pour la visibilité et la clarté du site d'Xpercuir.. je remercie Mohamed pour son professionnalisme et le travail accompli sur les sièges et le volant de mon véhicule qui a permis de revitaliser mon intérieur 👉Venant de Rabat je recommande sans hésitation 👍", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Jik Bbbb", message: "Excellent professionnel le travail est parfait très satisfait", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 mois") },
      { client_name: "anas lachaud", message: "Entreprise très bien très sérieux très arrangeant du travail de qualité satisfait je recommande cette entreprise sur Casablanca vous pouvez aller les yeux fermés", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 mois") },
      { client_name: "sann 57", message: "Je joins les deux photos pour pour que vous voyez le travail exceptionnel de cette entreprise expert cuir j'ai vraiment été étonné de leur travail exceptionnel minutieux vraiment rien à dire je recommande vivement", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "hind hassani", message: "Excellent travail et service. Xpercuir est une société très sérieuse que je recommande", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 mois") },
      { client_name: "khalidi hassan", message: "J'ai ramené la voiture de ma femme pour une rénovation cuire du volant, le résultat est satisfaisant. En plus que ça le personnel surtout si Mohamed était professionnel et à l'écoute.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Taha STAIFA", message: "Je recommande et je valide !!!", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 mois") },
      { client_name: "kam sab", message: "Équipe professionnelle très bonne qualité travaille propre sur volant", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Magali Mounier de Vérot", message: "Super travail ! De très beaux cuirs. Un travail de réfaction de grande qualité et des délais et des prix raisonnables ! Je recommande vivement !", rating: 5, status: "approved", created_at: getDateFromRelative("Modifié il y a un an") },
      { client_name: "achraf bouhkya", message: "Aujourd'hui j'ai ramené ma voiture le résultat est vraiment magnifique , l'accueil du personnel surtout achraf Je recommande vivement", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "Abdelfattah Menjour", message: "Excellent travail de rénovation de salon de voiture on dirait que c du neuf a recommander vivement", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "Abdelhak Danir", message: "Une vraie arnaque, pour un petit morceau de cuir de mon siège arrière auto, il me demande 800 dhs, je l'ai refais à 150 dhs just run.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "Amine MIRAOUI", message: "Excellent service et résultat conforme aux attentes !", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "Adel R", message: "Très bon service", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 8 mois") },
      { client_name: "Simohamed Laarif", message: "Good work, really professional", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "reda elhasnaoui", message: "Un service irréprochable avec un accueil de qualité. Je recommande", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Fouzia Kadiri", message: "Satisfaite pour ce travail bien fait.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "Adil Kad (Ma)", message: "Meilleur service très bon travail merci xpercuir", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Nacer Benis", message: "Je recommande pas 👎🏻", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "zeidane naoufel", message: "Chapeau mohamed et son équipe actuel, rien à dire , top !", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Abdessamad Oubaidi", message: "Je recommande, travail propre et soigné, volant cuir réparé.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "ayoub bouamira", message: "Rien a dire service top et professionnel et rapide", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Ilias Ouazzani Chahdi", message: "Excellent service, I highly recommend !", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "DR STONE", message: "Good work ! I highly recommend", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "zakaria abdoh el yazidi", message: "Service des experts !!! Bon travail merciiii", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Ait Mohamed", message: "Very good work", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Khannas", message: "Très satisfait", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 1 an") },
      { client_name: "Ossama El Ouafiq", message: "C'est magnifique.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "mohamed amine haloua", message: "Trés bonne prestation et cuir de qualité", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Soufiane KHABER", message: "Un expert , je recommande.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "ali b", message: "Professionnel top 5/5", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Youssef Zoubair", message: "Top super travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "reda laraqui hossini", message: "Très bon service", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Mafaz Idrissi khamlichi", message: "Good job", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "youssef fahes", message: "Nice work", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Mehdi Sad", message: "Bon travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "علمي ياسين", message: "Good work", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "mohcine harraz", message: "Bon travaille", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Imane Bellami", message: "Excellent service !", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Mohamed Gossair", message: "Very good work", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Khalil Benani", message: "Very nice", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Youssef Lebbar", message: "Excellent travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Fayçal El Fenni", message: "Great job", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Fatima Omami", message: "Nice job", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Chocho Saih", message: "Nice travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Mehdi Kazouini", message: "Satisfait du résultat !", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Yassine ASABAN", message: "Bon travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "echchaffi nabil", message: "Good job", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "midou madani", message: "Good", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Mehdi Mersoul", message: "Good work 👍", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Sam Fbs", message: "Very good work", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "younes alami", message: "Travail professionnel", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Azdine Housni", message: "Professionnel", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Mohamed Alami", message: "Good", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Simo Abdo", message: "Good work", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Mou3taz Bachi", message: "bon travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Samir Elbaz", message: "Bon travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Millenium Usinage", message: "Bon travail", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "chakib el bouni", message: "Excellent travail tbarkellah 3likoum", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 2 ans") },
      { client_name: "Karim Abdo", message: "Que Dieu vous bénisse", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") },
      { client_name: "Aziz Atar", message: "Merci pour votre bon travail.", rating: 5, status: "approved", created_at: getDateFromRelative("il y a 3 ans") }
    ]

    const { error: insertError } = await supabase
      .from('reviews')
      .insert(newReviews)

    if (insertError) {
      console.error('Error inserting reviews:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${newReviews.length} avis ont été créés avec succès`,
        count: newReviews.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
