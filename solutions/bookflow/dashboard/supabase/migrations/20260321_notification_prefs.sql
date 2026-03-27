-- Migration: Notification preferences system
-- Project: aaitnegjnhjwnthcmsnr (pacifikai-services)

-- ─── bookbot_notifications table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookbot_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES bookbot_businesses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_booking', 'cancellation', 'review', 'no_show', 'campaign_complete', 'waitlist_update')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_business_unread
  ON bookbot_notifications(business_id, is_read)
  WHERE is_read = false;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE bookbot_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies
    WHERE tablename = 'bookbot_notifications'
    AND policyname = 'Users see own notifications'
  ) THEN
    CREATE POLICY "Users see own notifications" ON bookbot_notifications
      FOR ALL USING (
        business_id IN (
          SELECT id FROM bookbot_businesses WHERE owner_user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── notification_prefs column on bookbot_businesses ─────────────────────────

ALTER TABLE bookbot_businesses ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{
  "new_booking": {"whatsapp": true, "email": true, "in_app": true},
  "cancellation": {"whatsapp": true, "email": false, "in_app": true},
  "review": {"whatsapp": false, "email": true, "in_app": true},
  "no_show": {"whatsapp": true, "email": false, "in_app": true},
  "campaign_complete": {"whatsapp": false, "email": false, "in_app": true},
  "waitlist_update": {"whatsapp": false, "email": false, "in_app": true}
}'::jsonb;
