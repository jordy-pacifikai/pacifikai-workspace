export type CampaignStatus =
  | 'new'
  | 'enriched'
  | 'sites_ready'
  | 'sent'
  | 'opened'
  | 'replied'
  | 'devis_sent'
  | 'converted'
  | 'lost';

export type CampaignSector =
  | 'beauty'
  | 'food'
  | 'auto'
  | 'health'
  | 'sport'
  | 'legal'
  | 'education'
  | 'tourism'
  | 'location'
  | 'other';

export interface Prospect {
  id: string;
  name: string;
  slug: string;
  sector: CampaignSector;
  subsector: string | null;
  city: string;
  island: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  description: string | null;
  facebook_page_name: string | null;
  facebook_page_likes: number | null;
  facebook_messenger_sent: boolean;
  icp_score: number;
  status: CampaignStatus;
  batch: number | null;
  prototype_urls: string[];
  email_sent_at: string | null;
  email_opened_at: string | null;
  replied_at: string | null;
  devis_sent_at: string | null;
  converted_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  relance_count: number;
  last_relance_at: string | null;
  last_relance_type: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailEvent {
  id: string;
  prospect_id: string;
  event_type: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
  email_type: 'initial' | 'j3' | 'j7' | 'j14' | 'custom';
  subject: string | null;
  brevo_message_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Note {
  id: string;
  prospect_id: string;
  author: string;
  content: string;
  note_type: 'note' | 'call' | 'meeting' | 'email' | 'facebook' | 'system';
  created_at: string;
}

export interface Batch {
  id: number;
  batch_number: number;
  sector: string | null;
  total_prospects: number;
  emails_sent: number;
  emails_opened: number;
  replied: number;
  converted: number;
  sent_at: string | null;
  created_at: string;
}
