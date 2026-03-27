import { logger } from "@/lib/logger";

const TRIGGER_API_URL =
  process.env.TRIGGER_API_URL ?? "https://api.trigger.dev";

/**
 * Fire a Trigger.dev task via REST API.
 * Returns true if accepted (2xx), false otherwise.
 *
 * Usage:
 *   await triggerTask("send-confirmation-email", { ... });
 *   triggerTask("send-cancellation-email", { ... }).catch(noop); // fire-and-forget
 */
export async function triggerTask(
  taskId: string,
  payload: Record<string, unknown>,
  options?: { idempotencyKey?: string },
): Promise<boolean> {
  const key = process.env.TRIGGER_SECRET_KEY;
  if (!key) {
    logger.error("TRIGGER_SECRET_KEY not configured", {
      action: "trigger_task",
      taskId,
    });
    return false;
  }

  const res = await fetch(
    `${TRIGGER_API_URL}/api/v1/tasks/${taskId}/trigger`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(options?.idempotencyKey
          ? { "Idempotency-Key": options.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        payload,
        ...(options?.idempotencyKey
          ? { options: { idempotencyKey: options.idempotencyKey } }
          : {}),
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "unknown");
    logger.error("Trigger task HTTP error", {
      action: "trigger_task",
      taskId,
      status: String(res.status),
      detail,
    });
    return false;
  }

  return true;
}
