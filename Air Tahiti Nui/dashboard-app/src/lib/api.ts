// API configuration for n8n webhooks
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.srv1140766.hstgr.cloud/webhook'

export const WEBHOOKS = {
  // Builds 1-10 (original)
  concierge: `${N8N_BASE_URL}/atn-concierge`,
  newsletter: `${N8N_BASE_URL}/atn-newsletter-demo`,
  seoContent: `${N8N_BASE_URL}/atn-seo-content`,
  roiAnalyst: `${N8N_BASE_URL}/atn-roi-analyst`,
  bookingAssistant: `${N8N_BASE_URL}/atn-booking-assistant`,
  socialMonitor: `${N8N_BASE_URL}/atn-social-monitor`,
  competitorIntel: `${N8N_BASE_URL}/atn-competitor-intel`,
  flightNotifier: `${N8N_BASE_URL}/atn-flight-notifier`,
  reviewResponder: `${N8N_BASE_URL}/atn-review-responder`,
  upsellEngine: `${N8N_BASE_URL}/atn-upsell-engine`,

  // Builds 11-14 (dashboard)
  dashboardApi: `${N8N_BASE_URL}/atn-dashboard-api`,
  contentScheduler: `${N8N_BASE_URL}/atn-content-scheduler`,
  assistant: `${N8N_BASE_URL}/atn-assistant`,
  reportGenerator: `${N8N_BASE_URL}/atn-report-generator`,

  // Build 15 (smart content)
  smartGenerator: `${N8N_BASE_URL}/atn-smart-generator`,
}

// Dashboard API actions
export type DashboardAction =
  | 'get_calendar'
  | 'create_content'
  | 'update_content'
  | 'delete_content'
  | 'get_prompts'
  | 'update_prompt'

interface DashboardApiParams {
  action: DashboardAction
  [key: string]: any
}

export async function callDashboardApi(params: DashboardApiParams) {
  try {
    const response = await fetch(WEBHOOKS.dashboardApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return await response.json()
  } catch (error) {
    console.error('Dashboard API error:', error)
    return { success: false, error: String(error) }
  }
}

// Calendar API
export async function getCalendarContent(startDate?: string, endDate?: string) {
  return callDashboardApi({
    action: 'get_calendar',
    start_date: startDate,
    end_date: endDate,
  })
}

export async function createContent(data: {
  type: 'newsletter' | 'article'
  title: string
  scheduled_date: string
  status?: string
  category?: string
}) {
  return callDashboardApi({
    action: 'create_content',
    ...data,
  })
}

export async function updateContent(recordId: string, data: {
  title?: string
  scheduled_date?: string
  status?: string
  prompt_history?: string
}) {
  return callDashboardApi({
    action: 'update_content',
    record_id: recordId,
    ...data,
  })
}

export async function deleteContent(recordId: string) {
  return callDashboardApi({
    action: 'delete_content',
    record_id: recordId,
  })
}

// Prompts API
export async function getPrompts() {
  return callDashboardApi({ action: 'get_prompts' })
}

export async function updatePrompt(recordId: string, promptText: string, currentVersion?: number) {
  return callDashboardApi({
    action: 'update_prompt',
    record_id: recordId,
    prompt_text: promptText,
    current_version: currentVersion,
  })
}

// AI Assistant API
export async function sendAssistantMessage(message: string, sessionId?: string) {
  try {
    const response = await fetch(WEBHOOKS.assistant, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    })
    return await response.json()
  } catch (error) {
    console.error('Assistant API error:', error)
    return { success: false, error: String(error) }
  }
}

// Report Generator API
export type ReportType =
  | 'daily-summary'
  | 'weekly-marketing'
  | 'roi-analysis'
  | 'customer-satisfaction'
  | 'upsell-performance'
  | 'competitor-intel'
  | 'flight-ops'
  | 'content-seo'
  | 'custom'

export async function generateReport(reportType: ReportType, customPrompt?: string) {
  try {
    const response = await fetch(WEBHOOKS.reportGenerator, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_type: reportType,
        custom_prompt: customPrompt,
        requested_by: 'dashboard',
      }),
    })
    return await response.json()
  } catch (error) {
    console.error('Report Generator error:', error)
    return { success: false, error: String(error) }
  }
}

// Trigger other workflows
export async function triggerNewsletter(params: { title?: string; segment?: string }) {
  try {
    const response = await fetch(WEBHOOKS.newsletter, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, source: 'dashboard' }),
    })
    return await response.json()
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function triggerArticle(params: { topic?: string; keywords?: string[] }) {
  try {
    const response = await fetch(WEBHOOKS.seoContent, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, source: 'dashboard' }),
    })
    return await response.json()
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Smart Content Generator API (Build 15)
export async function triggerSmartGeneration() {
  try {
    const response = await fetch(WEBHOOKS.smartGenerator, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'dashboard', trigger: 'manual' }),
    })
    return await response.json()
  } catch (error) {
    console.error('Smart Generator error:', error)
    return { success: false, error: String(error) }
  }
}

// Content Config API (Airtable direct)
const AIRTABLE_BASE_ID = 'appWd0x5YZPHKL0VK'
const AIRTABLE_CONFIG_TABLE = 'tblXiGcSXWEmeHe2B'

export interface ContentConfig {
  generation_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  content_per_week: number
  newsletters_per_week: number
  articles_per_week: number
  advance_weeks: number
  auto_suggestions: boolean
  suggestion_threshold: number
}

export async function getContentConfig(): Promise<ContentConfig | null> {
  // In production, this would call Airtable API directly
  // For now, return default config or call through dashboard API
  return {
    generation_frequency: 'weekly',
    content_per_week: 7,
    newsletters_per_week: 3,
    articles_per_week: 4,
    advance_weeks: 4,
    auto_suggestions: true,
    suggestion_threshold: 20,
  }
}

export async function updateContentConfig(config: Partial<ContentConfig>) {
  // This would update Airtable via dashboard API
  return callDashboardApi({
    action: 'update_config' as DashboardAction,
    config,
  })
}
