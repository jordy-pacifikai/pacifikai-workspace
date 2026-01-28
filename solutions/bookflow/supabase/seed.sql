-- ============================================
-- BOOKFLOW - Seed Data (Donnees de test)
-- ============================================

-- Creer un utilisateur de test (a faire via Supabase Auth UI)
-- L'ID sera genere automatiquement

-- ============================================
-- BUSINESS DE TEST: Salon Marie
-- ============================================
INSERT INTO businesses (
  id,
  owner_id, -- A remplacer par un vrai user_id apres creation du compte
  name,
  slug,
  owner_name,
  phone,
  email,
  address,
  city,
  postal_code,
  country,
  latitude,
  longitude,
  category,
  description,
  is_visible,
  subscription_plan,
  subscription_status
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  NULL, -- A mettre a jour
  'Salon Marie',
  'salon-marie',
  'Marie Tetuanui',
  '+68987123456',
  'marie@salonmarie.pf',
  '123 Avenue Pomare',
  'Papeete',
  '98714',
  'PF',
  -17.5334,
  -149.5667,
  'coiffure',
  'Salon de coiffure au coeur de Papeete. Specialiste couleur et balayage. Ambiance chaleureuse et professionnelle.',
  true,
  'starter',
  'active'
);

-- ============================================
-- SERVICES DU SALON MARIE
-- ============================================
INSERT INTO services (business_id, name, description, duration, price, category, is_active, display_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coupe Homme', 'Coupe classique homme', 30, 3500, 'coupe', true, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coupe Femme', 'Coupe et brushing', 45, 5000, 'coupe', true, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coupe Enfant', 'Coupe enfant (-12 ans)', 20, 2500, 'coupe', true, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Couleur', 'Coloration complete', 90, 12000, 'couleur', true, 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Meches', 'Meches ou balayage', 120, 15000, 'couleur', true, 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Brushing', 'Brushing simple', 30, 3000, 'coiffage', true, 6),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chignon', 'Chignon evenement', 60, 8000, 'coiffage', true, 7),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Soin profond', 'Soin keratine ou hydratant', 45, 6000, 'soin', true, 8);

-- ============================================
-- REGLES DE FIDELITE
-- ============================================
INSERT INTO loyalty_rules (
  business_id,
  is_active,
  points_per_visit,
  points_per_1000xpf,
  reward_threshold,
  reward_type,
  reward_value,
  reward_message
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  true,
  10,
  1,
  100,
  'percentage',
  10,
  'Bravo ! Tu as gagne 10% de reduction sur ta prochaine prestation !'
);

-- ============================================
-- CLIENTS DE TEST
-- ============================================
INSERT INTO clients (id, business_id, name, phone, email, loyalty_points, total_visits, preferred_contact) VALUES
('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Hina Teriitehau', '+68987111111', 'hina@mail.pf', 45, 5, 'push'),
('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Moana Temauri', '+68987222222', 'moana@mail.pf', 120, 12, 'sms'),
('c3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Teiva Pautu', '+68987333333', NULL, 0, 0, 'push');

-- ============================================
-- RENDEZ-VOUS DE TEST
-- ============================================
-- RDV aujourd'hui
INSERT INTO appointments (
  business_id,
  client_id,
  service_id,
  date,
  start_time,
  end_time,
  duration,
  status,
  source,
  price
) VALUES
-- RDV du jour
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'c1111111-1111-1111-1111-111111111111',
  (SELECT id FROM services WHERE business_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Coupe Femme'),
  CURRENT_DATE,
  '10:00',
  '10:45',
  45,
  'confirmed',
  'app',
  5000
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'c2222222-2222-2222-2222-222222222222',
  (SELECT id FROM services WHERE business_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Couleur'),
  CURRENT_DATE,
  '14:00',
  '15:30',
  90,
  'confirmed',
  'chatbot',
  12000
),
-- RDV demain
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'c3333333-3333-3333-3333-333333333333',
  (SELECT id FROM services WHERE business_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Coupe Homme'),
  CURRENT_DATE + 1,
  '09:00',
  '09:30',
  30,
  'confirmed',
  'web',
  3500
);

-- ============================================
-- AVIS DE TEST
-- ============================================
INSERT INTO reviews (business_id, client_id, rating, comment, is_visible, is_verified) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1111111-1111-1111-1111-111111111111', 5, 'Excellente coiffeuse ! Marie est tres professionnelle et a l ecoute. Je recommande !', true, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c2222222-2222-2222-2222-222222222222', 4, 'Tres bon salon, ambiance agreable. Un peu d attente mais le resultat en vaut la peine.', true, true);

-- ============================================
-- SECOND BUSINESS: Studio Nails by Vaea
-- ============================================
INSERT INTO businesses (
  id,
  name,
  slug,
  owner_name,
  phone,
  email,
  address,
  city,
  category,
  description,
  is_visible,
  subscription_plan
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-ef1234567891',
  'Studio Nails by Vaea',
  'studio-nails-vaea',
  'Vaea Temaru',
  '+68987654321',
  'vaea@studionails.pf',
  '45 Rue du Commerce',
  'Papeete',
  'ongles',
  'Prothesiste ongulaire specialisee en nail art. Gel, semi-permanent, extensions.',
  true,
  'pro'
);

INSERT INTO services (business_id, name, description, duration, price, category, is_active, display_order) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Manucure simple', 'Manucure classique avec vernis', 30, 3000, 'manucure', true, 1),
('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Semi-permanent', 'Pose vernis semi-permanent', 45, 5000, 'manucure', true, 2),
('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Gel UV', 'Pose complete gel UV', 90, 8000, 'gel', true, 3),
('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Nail Art', 'Decoration artistique', 30, 2000, 'decoration', true, 4),
('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Depose', 'Depose gel ou semi-permanent', 30, 2500, 'entretien', true, 5);

INSERT INTO loyalty_rules (business_id, is_active, points_per_visit, reward_threshold, reward_type, reward_value) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567891', true, 15, 150, 'fixed_amount', 2000);

-- ============================================
-- MISE A JOUR DES STATS
-- ============================================
-- Mettre a jour rating et review_count manuellement pour les tests
UPDATE businesses SET rating = 4.5, review_count = 2 WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
