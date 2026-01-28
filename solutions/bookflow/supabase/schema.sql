-- ============================================
-- BOOKFLOW - Schema Supabase
-- SaaS Prise de RDV pour metiers beaute/bien-etre
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Pour la geolocalisation

-- ============================================
-- 1. BUSINESSES (les pros inscrits)
-- ============================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Infos de base
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL publique: bookflow.app/pro/[slug]
  owner_name TEXT,
  phone TEXT,
  email TEXT,

  -- Localisation
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'PF', -- Polynesie francaise
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Profil
  category TEXT CHECK (category IN ('coiffure', 'ongles', 'bien-etre', 'sport', 'beaute', 'autre')),
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,

  -- Reseaux sociaux
  instagram TEXT,
  facebook TEXT,
  website TEXT,

  -- Visibilite
  is_visible BOOLEAN DEFAULT true, -- visible dans l'annuaire
  is_verified BOOLEAN DEFAULT false, -- verifie par PACIFIK'AI

  -- Configuration horaires
  opening_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "is_open": true},
    "tuesday": {"open": "09:00", "close": "18:00", "is_open": true},
    "wednesday": {"open": "09:00", "close": "18:00", "is_open": true},
    "thursday": {"open": "09:00", "close": "18:00", "is_open": true},
    "friday": {"open": "09:00", "close": "18:00", "is_open": true},
    "saturday": {"open": "09:00", "close": "12:00", "is_open": true},
    "sunday": {"open": null, "close": null, "is_open": false}
  }'::JSONB,
  break_time JSONB, -- {"start": "12:00", "end": "14:00"}
  default_slot_duration INT DEFAULT 30, -- minutes
  booking_buffer INT DEFAULT 0, -- minutes entre RDV
  max_advance_booking_days INT DEFAULT 30, -- reservation max X jours a l'avance
  min_advance_booking_hours INT DEFAULT 2, -- reservation min X heures a l'avance

  -- Rebooking
  rebooking_reminder_weeks INT DEFAULT 6, -- rappel apres X semaines sans RDV

  -- Abonnement
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'trial')),
  trial_ends_at TIMESTAMPTZ,

  -- Stats
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INT DEFAULT 0,
  total_bookings INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_visible ON businesses(is_visible) WHERE is_visible = true;

-- ============================================
-- 2. SERVICES (prestations)
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  duration INT NOT NULL, -- minutes
  price INT, -- en XPF (centimes pour precision)

  category TEXT, -- sous-categorie: "coupe", "couleur", "soin", etc.
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0, -- ordre d'affichage

  -- Pour fidelite
  loyalty_points_earned INT DEFAULT 0, -- points gagnes pour ce service

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_services_active ON services(business_id, is_active) WHERE is_active = true;

-- ============================================
-- 3. CLIENTS (clients des pros)
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL si guest booking
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  -- Infos
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,

  -- Preferences
  preferred_contact TEXT DEFAULT 'push' CHECK (preferred_contact IN ('push', 'sms', 'email', 'none')),

  -- Fidelite
  loyalty_points INT DEFAULT 0,
  total_visits INT DEFAULT 0,
  total_spent INT DEFAULT 0, -- en XPF
  last_visit_at TIMESTAMPTZ,

  -- Notes pro
  notes TEXT,
  tags TEXT[], -- ["VIP", "fidele", "nouveau"]

  -- No-show tracking
  no_show_count INT DEFAULT 0,
  requires_confirmation BOOLEAN DEFAULT false, -- true si trop de no-shows

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un client unique par business + phone
  UNIQUE(business_id, phone)
);

CREATE INDEX idx_clients_business ON clients(business_id);
CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_clients_phone ON clients(business_id, phone);

-- ============================================
-- 4. APPOINTMENTS (RDV)
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Date/Heure
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INT NOT NULL, -- minutes (copie du service au moment de la reservation)

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),

  -- Source
  source TEXT DEFAULT 'app' CHECK (source IN ('app', 'web', 'manual', 'chatbot', 'guest')),

  -- Infos supplementaires
  notes TEXT, -- notes du client
  pro_notes TEXT, -- notes du pro (privees)
  price INT, -- prix au moment de la reservation

  -- Rappels
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_2h_sent BOOLEAN DEFAULT false,
  confirmation_required BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,

  -- Fidelite
  points_earned INT DEFAULT 0,
  loyalty_reward_applied TEXT, -- ex: "10% reduction"

  -- Guest booking (si pas de compte)
  guest_name TEXT,
  guest_phone TEXT,
  guest_token TEXT UNIQUE, -- token pour gerer le RDV sans compte

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_appointments_business_date ON appointments(business_id, date);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_guest_token ON appointments(guest_token) WHERE guest_token IS NOT NULL;

-- ============================================
-- 5. LOYALTY_RULES (regles fidelite par business)
-- ============================================
CREATE TABLE loyalty_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,

  is_active BOOLEAN DEFAULT true,

  -- Regles d'accumulation
  points_per_visit INT DEFAULT 10,
  points_per_1000xpf INT DEFAULT 1, -- 1 point par 1000 XPF depenses

  -- Recompenses
  reward_threshold INT DEFAULT 100, -- points necessaires
  reward_type TEXT DEFAULT 'percentage' CHECK (reward_type IN ('percentage', 'fixed_amount', 'free_service')),
  reward_value INT DEFAULT 10, -- 10% ou 1000 XPF ou service_id
  reward_service_id UUID REFERENCES services(id), -- si free_service

  -- Message personnalise
  reward_message TEXT DEFAULT 'Felicitations ! Vous avez gagne une recompense !',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. LOYALTY_REDEMPTIONS (historique recompenses)
-- ============================================
CREATE TABLE loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  points_used INT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value INT NOT NULL,
  reward_description TEXT, -- "10% de reduction"

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redemptions_client ON loyalty_redemptions(client_id);

-- ============================================
-- 7. REVIEWS (avis clients)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Moderation
  is_visible BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false, -- avis d'un vrai client

  -- Reponse du pro
  pro_response TEXT,
  pro_responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_visible ON reviews(business_id, is_visible) WHERE is_visible = true;

-- ============================================
-- 8. CHAT_MESSAGES (historique conversations chatbot)
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Conversation
  session_id UUID NOT NULL, -- groupe les messages d'une conversation
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Metadata
  action_taken TEXT, -- "booking_created", "booking_cancelled", etc.
  action_data JSONB, -- {booking_id: "xxx"}

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_session ON chat_messages(session_id);
CREATE INDEX idx_chat_client ON chat_messages(client_id);

-- ============================================
-- 9. PUSH_TOKENS (tokens pour notifications push)
-- ============================================
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),

  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);

-- ============================================
-- 10. BLOCKED_SLOTS (creneaux bloques manuellement)
-- ============================================
CREATE TABLE blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  reason TEXT, -- "Pause", "Formation", "Vacances"
  is_recurring BOOLEAN DEFAULT false, -- se repete chaque semaine

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocked_business_date ON blocked_slots(business_id, date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- BUSINESSES
-- Lecture publique pour les businesses visibles
CREATE POLICY "Public can view visible businesses" ON businesses
  FOR SELECT USING (is_visible = true);

-- Pros peuvent tout faire sur leur business
CREATE POLICY "Owners can manage own business" ON businesses
  FOR ALL USING (owner_id = auth.uid());

-- SERVICES
-- Lecture publique pour les services des businesses visibles
CREATE POLICY "Public can view services of visible businesses" ON services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = services.business_id AND is_visible = true)
  );

-- Pros peuvent gerer leurs services
CREATE POLICY "Owners can manage own services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = services.business_id AND owner_id = auth.uid())
  );

-- CLIENTS
-- Pros voient leurs clients
CREATE POLICY "Owners can manage own clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = clients.business_id AND owner_id = auth.uid())
  );

-- Clients peuvent voir leur propre profil
CREATE POLICY "Clients can view own profile" ON clients
  FOR SELECT USING (user_id = auth.uid());

-- APPOINTMENTS
-- Pros voient tous les RDV de leur business
CREATE POLICY "Owners can manage appointments" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = appointments.business_id AND owner_id = auth.uid())
  );

-- Clients voient leurs propres RDV
CREATE POLICY "Clients can view own appointments" ON appointments
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Acces par guest token
CREATE POLICY "Guest can access by token" ON appointments
  FOR SELECT USING (
    guest_token IS NOT NULL AND guest_token = current_setting('app.guest_token', true)
  );

-- REVIEWS
-- Lecture publique des avis visibles
CREATE POLICY "Public can view visible reviews" ON reviews
  FOR SELECT USING (is_visible = true);

-- Pros peuvent gerer les avis de leur business
CREATE POLICY "Owners can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = reviews.business_id AND owner_id = auth.uid())
  );

-- Clients peuvent creer des avis
CREATE POLICY "Clients can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- PUSH_TOKENS
CREATE POLICY "Users can manage own push tokens" ON push_tokens
  FOR ALL USING (user_id = auth.uid());

-- BLOCKED_SLOTS
CREATE POLICY "Owners can manage blocked slots" ON blocked_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = blocked_slots.business_id AND owner_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Fonction pour generer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INT := 0;
BEGIN
  -- Nettoyer le nom
  new_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  new_slug := regexp_replace(new_slug, '^-|-$', '', 'g');

  -- Verifier unicite
  WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = new_slug || CASE WHEN counter > 0 THEN '-' || counter ELSE '' END) LOOP
    counter := counter + 1;
  END LOOP;

  IF counter > 0 THEN
    new_slug := new_slug || '-' || counter;
  END IF;

  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre a jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fonction pour mettre a jour les stats du business apres un avis
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = NEW.business_id AND is_visible = true),
    review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id AND is_visible = true)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- Fonction pour generer un token guest
CREATE OR REPLACE FUNCTION generate_guest_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les creneaux disponibles
CREATE OR REPLACE FUNCTION get_available_slots(
  p_business_id UUID,
  p_date DATE,
  p_service_duration INT DEFAULT 30
)
RETURNS TABLE (
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_opening_hours JSONB;
  v_day_name TEXT;
  v_open_time TIME;
  v_close_time TIME;
  v_is_open BOOLEAN;
  v_slot_duration INT;
  v_buffer INT;
  v_current_slot TIME;
BEGIN
  -- Obtenir les infos du business
  SELECT opening_hours, default_slot_duration, booking_buffer
  INTO v_opening_hours, v_slot_duration, v_buffer
  FROM businesses WHERE id = p_business_id;

  -- Jour de la semaine
  v_day_name := lower(to_char(p_date, 'day'));
  v_day_name := trim(v_day_name);

  -- Horaires du jour
  v_is_open := (v_opening_hours -> v_day_name ->> 'is_open')::BOOLEAN;

  IF NOT v_is_open THEN
    RETURN;
  END IF;

  v_open_time := (v_opening_hours -> v_day_name ->> 'open')::TIME;
  v_close_time := (v_opening_hours -> v_day_name ->> 'close')::TIME;

  -- Utiliser la duree du service demande
  IF p_service_duration IS NOT NULL THEN
    v_slot_duration := p_service_duration;
  END IF;

  -- Generer les creneaux
  v_current_slot := v_open_time;

  WHILE v_current_slot + (v_slot_duration || ' minutes')::INTERVAL <= v_close_time LOOP
    slot_time := v_current_slot;

    -- Verifier si le creneau est disponible
    is_available := NOT EXISTS (
      SELECT 1 FROM appointments
      WHERE business_id = p_business_id
        AND date = p_date
        AND status NOT IN ('cancelled')
        AND (
          (start_time <= v_current_slot AND end_time > v_current_slot)
          OR (start_time < v_current_slot + (v_slot_duration || ' minutes')::INTERVAL AND end_time >= v_current_slot + (v_slot_duration || ' minutes')::INTERVAL)
          OR (start_time >= v_current_slot AND end_time <= v_current_slot + (v_slot_duration || ' minutes')::INTERVAL)
        )
    ) AND NOT EXISTS (
      SELECT 1 FROM blocked_slots
      WHERE business_id = p_business_id
        AND date = p_date
        AND (
          (start_time <= v_current_slot AND end_time > v_current_slot)
          OR (start_time < v_current_slot + (v_slot_duration || ' minutes')::INTERVAL AND end_time >= v_current_slot + (v_slot_duration || ' minutes')::INTERVAL)
        )
    );

    RETURN NEXT;

    v_current_slot := v_current_slot + (v_slot_duration + v_buffer || ' minutes')::INTERVAL;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (pour tests)
-- ============================================
-- A executer separement dans seed.sql
