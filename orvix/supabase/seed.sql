-- Seed: Orvix software catalogue (safe to re-run)
-- Prices are left empty ("Sur devis"): set them in Admin → Logiciels.

insert into public.products (slug, name, category, tagline, description, features, modules, platforms, pricing_model, sort_order)
values
  ('pharmacie', 'Orvix Pharma', 'sante', 'Gestion de pharmacie avec scan des médicaments',
   'Vendez plus vite au comptoir grâce au scan du code-barres, suivez chaque lot jusqu''à sa date de péremption et connaissez votre bénéfice réel à la fin de la journée.',
   array['Scan code-barres des médicaments', 'Alertes de péremption et de rupture', 'Bénéfices par jour, par produit et par fournisseur', 'Factures et bons de livraison fournisseurs', 'Plusieurs postes et utilisateurs', 'Activation par clé de licence']::text[],
   array['Caisse', 'Stock', 'Fournisseurs', 'Rapports', 'Utilisateurs']::text[], array['Windows']::text[], 'devis', 10),
  ('cabinet-medical', 'Orvix Cabinet', 'sante', 'Dossiers patients, rendez-vous et ordonnances',
   'Le dossier de chaque patient au même endroit : antécédents, consultations, ordonnances imprimées en un clic et agenda des rendez-vous de la semaine.',
   array['Dossier patient complet', 'Agenda des rendez-vous', 'Ordonnances et certificats imprimables', 'Suivi des paiements et des visites', 'Accès protégé par mot de passe']::text[],
   array['Patients', 'Agenda', 'Ordonnances', 'Caisse']::text[], array['Windows']::text[], 'devis', 20),
  ('opticien', 'Orvix Optic', 'sante', 'Gestion de magasin d''optique',
   'Fiches clients avec mesures et prescriptions, stock de montures et de verres, commandes atelier et suivi des ventes.',
   array['Prescriptions et mesures par client', 'Stock montures, verres et lentilles', 'Commandes et suivi atelier', 'Ventes, acomptes et reste à payer']::text[],
   array['Clients', 'Stock', 'Atelier', 'Ventes']::text[], array['Windows']::text[], 'devis', 30),
  ('superette', 'Orvix Market', 'commerce', 'Caisse de superette avec crédit clients',
   'Encaissez au scan, gérez le carnet de crédit de vos clients sans papier et voyez en temps réel ce qui reste en rayon.',
   array['Caisse rapide au code-barres', 'Carnet de crédit par client', 'Stock et alertes de réapprovisionnement', 'Clôture de caisse journalière', 'Impression de tickets']::text[],
   array['Caisse', 'Stock', 'Clients & crédit', 'Rapports']::text[], array['Windows']::text[], 'devis', 40),
  ('restaurant', 'Orvix Resto', 'commerce', 'Caisse restaurant et pizzeria',
   'Prise de commande sur place, à emporter ou en livraison, tickets cuisine et suivi des ventes par article et par serveur.',
   array['Commandes sur place, à emporter et livraison', 'Tickets cuisine automatiques', 'Menu, suppléments et formules', 'Ventes par article, serveur et jour', 'Gestion des tables']::text[],
   array['Caisse', 'Cuisine', 'Menu', 'Rapports']::text[], array['Windows']::text[], 'devis', 50),
  ('gestion-stock', 'Orvix Stock', 'commerce', 'Stock, achats et ventes pour grossistes et dépôts',
   'Entrées, sorties, inventaires et mouvements entre dépôts, avec l''historique complet de chaque article.',
   array['Entrées, sorties et transferts', 'Inventaires et écarts', 'Plusieurs dépôts', 'Fournisseurs et clients', 'Valeur du stock en temps réel']::text[],
   array['Articles', 'Mouvements', 'Inventaire', 'Rapports']::text[], array['Windows']::text[], 'devis', 60),
  ('salon-coiffure', 'Orvix Salon', 'services', 'Rendez-vous et caisse pour salons de coiffure',
   'Planning des rendez-vous par employé, fiche client avec historique des prestations et caisse intégrée.',
   array['Planning par employé', 'Historique des prestations par client', 'Caisse et commissions', 'Produits et stock']::text[],
   array['Agenda', 'Clients', 'Caisse', 'Employés']::text[], array['Windows']::text[], 'devis', 70),
  ('creche', 'Orvix Kids', 'services', 'Gestion de crèche et jardin d''enfants',
   'Inscriptions, présences, paiements mensuels des parents et informations de contact, organisés par groupe.',
   array['Inscriptions et fiches enfants', 'Présences journalières', 'Paiements mensuels et impayés', 'Groupes et éducatrices']::text[],
   array['Enfants', 'Présences', 'Paiements', 'Groupes']::text[], array['Windows']::text[], 'devis', 80),
  ('dj-evenements', 'Orvix Events', 'services', 'Réservations pour DJ, mariages et fêtes',
   'Calendrier des événements, contrats, acomptes et matériel réservé pour chaque date, sans double réservation.',
   array['Calendrier des événements', 'Contrats et acomptes', 'Matériel par événement', 'Rappels des dates à venir']::text[],
   array['Calendrier', 'Clients', 'Contrats', 'Matériel']::text[], array['Windows']::text[], 'devis', 90),
  ('agence-voyage', 'Orvix Travel', 'agences', 'Front-office d''agence de voyage, même hors ligne',
   'Billets, hôtels, omra et circuits : dossiers clients, paiements et documents de voyage, utilisable sans connexion internet.',
   array['Dossiers clients et passagers', 'Billetterie, hôtels, omra et circuits', 'Paiements et reste à payer', 'Fonctionne hors ligne', 'Documents de voyage imprimables']::text[],
   array['Dossiers', 'Ventes', 'Caisse', 'Rapports']::text[], array['Windows']::text[], 'devis', 100),
  ('agence-architecture', 'Orvix Archi', 'agences', 'Gestion d''agence d''architecture, trilingue',
   'Projets, phases, honoraires et documents de chantier, avec une interface en français, arabe et anglais.',
   array['Projets et phases', 'Honoraires et paiements', 'Documents par projet', 'Interface FR / AR / EN']::text[],
   array['Projets', 'Clients', 'Honoraires', 'Documents']::text[], array['Windows']::text[], 'devis', 110)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('phone', '0668 79 22 39'),
  ('whatsapp', '213668792239'),
  ('email', 'contact@orvix.dz'),
  ('city', 'Algérie'),
  ('announcement', '')
on conflict (key) do nothing;

-- ---------------------------------------------------------------
-- Make YOUR account admin (after you sign up on the site once):
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- (Run it here in the SQL editor: the trigger blocks this from the website.)
-- ---------------------------------------------------------------
