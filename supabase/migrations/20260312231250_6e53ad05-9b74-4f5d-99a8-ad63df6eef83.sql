-- Insert the 3 reviews
INSERT INTO reviews (client_name, message, rating, status, created_at) VALUES
('Juls Mens', 'J''ai fait réparer le cuir du tableau de bord et rénover mon volant, impeccable 👌🏻 ! Des personnes gentilles, professionnelles, un très bon résultat ! Merci je recommande.', 5, 'approved', now() - interval '2 months'),
('Anouar Ghrib', 'Un service et un résultat exceptionnels ! Un vrai professionnel du cuir et du plastique, pour voiture ou mobilier. Résultat époustouflant 🥰 Je recommande vivement !', 5, 'approved', now() - interval '2 months'),
('Youssef M', 'Très content du résultat sur le volant de ma BMW, rapide, efficace et professionnel, je recommande vivement.', 5, 'approved', now() - interval '6 months');
