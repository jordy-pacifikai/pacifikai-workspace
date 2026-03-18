/**
 * PACIFIK'AI - Workflow Generator
 *
 * Genere des workflows n8n personnalises a partir de templates
 * et des donnees client (prospectData JSON)
 */

const TEMPLATES = {
  'chatbot-client': require('./chatbot-client.json'),
  'newsletter-engine': require('./newsletter-engine.json'),
  // Ajouter d'autres templates ici
};

const DEFAULT_VARIABLES = {
  ANTHROPIC_API_KEY: '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',
  SUPABASE_HOST: 'ogsimsfqwibcmotaeevb.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4ODAzMTgsImV4cCI6MjA1MzQ1NjMxOH0.4mwQ9dVTcFGGCWHTVB3leHbNjU1Yo2j7fCKQqbxvL7A',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg4MDMxOCwiZXhwIjoyMDUzNDU2MzE4fQ.RPQM7rYPCg-uuCHsLTHu1MdPnFKvXugFC5hkLlcMenc'
};

/**
 * Genere un slug a partir du nom de l'entreprise
 */
function generateSlug(companyName) {
  return companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Determine le tone/personnalite selon le secteur
 */
function getToneForSector(sector) {
  const tones = {
    'Aviation': { personality: 'Professionnel et rassurant', tone: 'Formel mais chaleureux' },
    'Hotellerie': { personality: 'Accueillant et attentionne', tone: 'Chaleureux et personnalise' },
    'E-commerce': { personality: 'Dynamique et efficace', tone: 'Direct et engageant' },
    'Banque': { personality: 'Serieux et fiable', tone: 'Professionnel et precis' },
    'Telecom': { personality: 'Technique mais accessible', tone: 'Clair et patient' },
    'Tourisme': { personality: 'Enthousiaste et inspirant', tone: 'Chaleureux et evocateur' },
    'Automobile': { personality: 'Expert et passionne', tone: 'Professionnel et conseiller' }
  };
  return tones[sector] || { personality: 'Professionnel et helpful', tone: 'Amical et competent' };
}

/**
 * Remplace toutes les variables dans un objet (recursif)
 */
function replaceVariables(obj, variables) {
  if (typeof obj === 'string') {
    let result = obj;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceVariables(item, variables));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceVariables(value, variables);
    }
    return result;
  }

  return obj;
}

/**
 * Genere un workflow a partir d'un template et des donnees prospect
 */
function generateWorkflow(templateId, prospectData, customVariables = {}) {
  const template = TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Template '${templateId}' not found`);
  }

  const company = prospectData.company || {};
  const slug = generateSlug(company.name || 'client');
  const tone = getToneForSector(company.sector);

  // Construire les variables
  const variables = {
    ...DEFAULT_VARIABLES,
    CLIENT_NAME: company.name || 'Client',
    CLIENT_SLUG: slug,
    SUPABASE_SCHEMA: slug.replace(/-/g, '_'),
    PERSONALITY: tone.personality,
    TONE: tone.tone,
    BRAND_TONE: tone.tone,
    SENDER_NAME: company.name || 'PACIFIK\'AI',
    SENDER_EMAIL: `contact@${slug}.com`,
    ...customVariables
  };

  // Cloner le template et remplacer les variables
  const workflow = JSON.parse(JSON.stringify(template));
  delete workflow.meta; // Supprimer les metadonnees du template

  return replaceVariables(workflow, variables);
}

/**
 * Genere tous les workflows pour un client selon son tier
 */
function generateAllWorkflows(prospectData, tier = 'business') {
  const workflowsByTier = {
    starter: ['chatbot-client'],
    business: ['chatbot-client', 'newsletter-engine'],
    enterprise: ['chatbot-client', 'newsletter-engine'] // + autres a ajouter
  };

  const templateIds = workflowsByTier[tier] || workflowsByTier.starter;
  const workflows = [];

  for (const templateId of templateIds) {
    try {
      const workflow = generateWorkflow(templateId, prospectData);
      workflows.push({
        templateId,
        workflow,
        name: workflow.name
      });
    } catch (error) {
      console.error(`Error generating ${templateId}:`, error.message);
    }
  }

  return workflows;
}

/**
 * Exporte la config Supabase SQL pour le client
 */
function generateSupabaseSchema(prospectData) {
  const company = prospectData.company || {};
  const schema = generateSlug(company.name || 'client').replace(/-/g, '_');

  return `
-- Schema pour ${company.name || 'Client'}
CREATE SCHEMA IF NOT EXISTS ${schema};

-- Conversations chatbot
CREATE TABLE ${schema}.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON ${schema}.conversations (session_id, created_at DESC);

-- Leads et prospects
CREATE TABLE ${schema}.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  name TEXT,
  phone TEXT,
  company TEXT,
  score INT DEFAULT 0,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenu genere
CREATE TABLE ${schema}.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE ${schema}.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  preferences JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ pour RAG
CREATE TABLE ${schema}.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON ${schema}.faq USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function: Get conversation history
CREATE OR REPLACE FUNCTION ${schema}.get_conversation_history(p_session_id TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE (role TEXT, content TEXT, created_at TIMESTAMPTZ) AS $$
  SELECT role, content, created_at
  FROM ${schema}.conversations
  WHERE session_id = p_session_id
  ORDER BY created_at DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Function: Search FAQ (semantic)
CREATE OR REPLACE FUNCTION ${schema}.search_faq(query_text TEXT, match_count INT DEFAULT 3)
RETURNS TABLE (question TEXT, answer TEXT, similarity FLOAT) AS $$
  -- Note: Requires embedding generation via API
  SELECT question, answer, 0.8 as similarity
  FROM ${schema}.faq
  WHERE question ILIKE '%' || query_text || '%'
     OR answer ILIKE '%' || query_text || '%'
  LIMIT match_count;
$$ LANGUAGE sql STABLE;
`;
}

module.exports = {
  generateWorkflow,
  generateAllWorkflows,
  generateSupabaseSchema,
  generateSlug,
  getToneForSector,
  TEMPLATES
};

// Usage example (n8n Code node):
/*
const generator = require('./workflow-generator');
const prospectData = $input.first().json.prospectData;
const tier = prospectData.pricing?.recommended || 'business';

const workflows = generator.generateAllWorkflows(prospectData, tier);
const supabaseSQL = generator.generateSupabaseSchema(prospectData);

return { workflows, supabaseSQL };
*/
