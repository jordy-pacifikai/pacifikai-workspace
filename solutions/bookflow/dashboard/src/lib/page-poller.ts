/**
 * Page Inbox Poller client — registers/removes pages on the SpiderClaw VPS poller
 * so inbound Facebook Page messages get forwarded to Ve'a's webhook.
 */
import { logger } from './logger';

const POLLER_BASE_URL = process.env.PAGE_POLLER_URL || 'http://72.60.231.167:29321';
const POLLER_API_KEY = process.env.PAGE_POLLER_API_KEY || '';

async function pollerFetch(
  path: string,
  method: 'GET' | 'POST' | 'DELETE',
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(`${POLLER_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(POLLER_API_KEY ? { Authorization: `Bearer ${POLLER_API_KEY}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    logger.warn('Poller unreachable', { action: 'page_poller', error: String(err) });
    return { ok: false, data: { error: String(err) } };
  }
}

/**
 * Register a page with the poller. If it already exists, updates the token.
 * Non-blocking — failure here should NOT break the connect flow.
 */
export async function registerPageWithPoller(opts: {
  pageId: string;
  pageName: string;
  pageToken: string;
  businessId: string;
}): Promise<boolean> {
  const { ok, data } = await pollerFetch('/pages', 'POST', {
    page_id: opts.pageId,
    page_name: opts.pageName,
    page_token: opts.pageToken,
    business_id: opts.businessId,
  });

  if (ok) {
    logger.info('Page registered with poller', {
      action: 'page_poller_register',
      pageId: opts.pageId,
      pageName: opts.pageName,
      status: data.status,
    });
  } else {
    logger.warn('Failed to register page with poller', {
      action: 'page_poller_register',
      pageId: opts.pageId,
      error: JSON.stringify(data),
    });
  }

  return ok;
}

/**
 * Remove a page from the poller.
 * Non-blocking — failure here should NOT break the disconnect flow.
 */
export async function removePageFromPoller(pageId: string): Promise<boolean> {
  const { ok, data } = await pollerFetch(`/pages/${pageId}`, 'DELETE');

  if (ok) {
    logger.info('Page removed from poller', { action: 'page_poller_remove', pageId });
  } else {
    logger.warn('Failed to remove page from poller', {
      action: 'page_poller_remove',
      pageId,
      error: JSON.stringify(data),
    });
  }

  return ok;
}
