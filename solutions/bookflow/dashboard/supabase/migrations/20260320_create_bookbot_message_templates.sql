-- Migration: create bookbot_message_templates
-- Apply on project: aaitnegjnhjwnthcmsnr (pacifikai-services)

CREATE TABLE IF NOT EXISTS bookbot_message_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES bookbot_businesses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('confirmation', 'reminder_24h', 'reminder_1h', 'followup', 'birthday', 'review_request', 'cancellation', 'reschedule')),
  message text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(business_id, type)
);

ALTER TABLE bookbot_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON bookbot_message_templates
  FOR ALL USING (
    business_id IN (SELECT id FROM bookbot_businesses WHERE owner_user_id = auth.uid())
  );
