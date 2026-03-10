import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const EMBEDDING_MODEL = "mistral-embed";
const EMBEDDING_DIMENSIONS = 1024;
const MAX_CHUNK_LENGTH = 1500; // characters per chunk

function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

/**
 * Split text into chunks of ~MAX_CHUNK_LENGTH characters on sentence boundaries.
 */
function chunkText(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK_LENGTH) {
      chunks.push(remaining);
      break;
    }

    // Find a sentence boundary near the limit
    let cutPoint = remaining.lastIndexOf(". ", MAX_CHUNK_LENGTH);
    if (cutPoint < MAX_CHUNK_LENGTH * 0.5) {
      cutPoint = remaining.lastIndexOf("\n", MAX_CHUNK_LENGTH);
    }
    if (cutPoint < MAX_CHUNK_LENGTH * 0.3) {
      cutPoint = remaining.lastIndexOf(" ", MAX_CHUNK_LENGTH);
    }
    if (cutPoint < 100) {
      cutPoint = MAX_CHUNK_LENGTH;
    }

    chunks.push(remaining.slice(0, cutPoint + 1).trim());
    remaining = remaining.slice(cutPoint + 1).trim();
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Generate embeddings via Mistral AI API (if key available).
 * Returns null if no key or API error.
 */
async function generateEmbeddingsApi(
  texts: string[]
): Promise<number[][] | null> {
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (!mistralKey) return null;

  try {
    const res = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mistralKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts,
      }),
    });

    if (!res.ok) {
      logger.warn("Mistral embeddings API error", { status: res.status });
      return null;
    }

    const data = await res.json();
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  } catch (err) {
    logger.warn("Mistral embeddings failed", { error: String(err) });
    return null;
  }
}

export const generateEmbeddings = schemaTask({
  id: "generate-embeddings",
  schema: z.object({
    knowledgeId: z.string().uuid(),
    businessId: z.string().uuid(),
    action: z.enum(["upsert", "delete"]).default("upsert"),
  }),
  retry: { maxAttempts: 3 },
  run: async (payload) => {
    const { knowledgeId, businessId, action } = payload;

    // Delete existing embeddings for this knowledge doc
    const deleteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_embeddings?knowledge_id=eq.${knowledgeId}`,
      { method: "DELETE", headers: supaHeaders() }
    );

    if (!deleteRes.ok) {
      logger.error("Failed to delete old embeddings", { status: deleteRes.status });
    }

    logger.info("Deleted old embeddings", { knowledgeId });

    // If action is delete, we're done (FK CASCADE also handles this, but explicit is safer)
    if (action === "delete") {
      logger.info("Delete action — done", { knowledgeId });
      return { status: "deleted", knowledgeId };
    }

    // Fetch the knowledge document
    const docRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_knowledge?id=eq.${knowledgeId}&select=id,title,content,category`,
      { headers: supaHeaders() }
    );
    const docs = await docRes.json();
    if (!Array.isArray(docs) || docs.length === 0) {
      logger.warn("Knowledge doc not found", { knowledgeId });
      return { status: "not_found", knowledgeId };
    }

    const doc = docs[0];
    const fullText = `${doc.title}\n\n${doc.content}`;

    // Chunk the text
    const chunks = chunkText(fullText);
    logger.info("Chunked text", { knowledgeId, chunks: chunks.length, totalChars: fullText.length });

    // Try to generate vector embeddings (optional — works without MISTRAL_API_KEY)
    const embeddings = await generateEmbeddingsApi(chunks);
    const hasVectors = embeddings !== null && embeddings.length === chunks.length;

    if (hasVectors) {
      logger.info("Vector embeddings generated", { model: EMBEDDING_MODEL, dims: EMBEDDING_DIMENSIONS });
    } else {
      logger.info("No MISTRAL_API_KEY or API error — inserting chunks for FTS only");
    }

    // Prepare rows for insert (with or without embeddings)
    const rows = chunks.map((chunk, idx) => ({
      knowledge_id: knowledgeId,
      business_id: businessId,
      chunk_index: idx,
      chunk_text: chunk,
      ...(hasVectors ? { embedding: JSON.stringify(embeddings![idx]) } : {}),
    }));

    // Batch insert into bookbot_embeddings
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/bookbot_embeddings`, {
      method: "POST",
      headers: { ...supaHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      logger.error("Failed to insert embeddings", { status: insertRes.status, error: errText });
      throw new Error(`Insert failed: ${insertRes.status} ${errText}`);
    }

    logger.info("Embeddings stored", {
      knowledgeId,
      chunks: chunks.length,
      hasVectors,
    });

    return { status: "ok", knowledgeId, chunks: chunks.length, hasVectors };
  },
});
