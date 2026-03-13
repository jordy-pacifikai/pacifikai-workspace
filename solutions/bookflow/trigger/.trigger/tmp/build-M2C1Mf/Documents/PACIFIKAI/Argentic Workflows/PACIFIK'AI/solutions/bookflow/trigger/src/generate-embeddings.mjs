import {
  logger,
  schemaTask
} from "../../../../../../../../chunk-G5XPZL6L.mjs";
import "../../../../../../../../chunk-LQDRVYE2.mjs";
import {
  external_exports
} from "../../../../../../../../chunk-ALSC375A.mjs";
import {
  __name,
  init_esm
} from "../../../../../../../../chunk-DB4FHRYB.mjs";

// src/generate-embeddings.ts
init_esm();
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
var EMBEDDING_MODEL = "text-embedding-3-small";
var EMBEDDING_DIMENSIONS = 1024;
var MAX_CHUNK_LENGTH = 1500;
function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  };
}
__name(supaHeaders, "supaHeaders");
function chunkText(text) {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK_LENGTH) {
      chunks.push(remaining);
      break;
    }
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
__name(chunkText, "chunkText");
async function generateOpenAIEmbeddings(texts) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
        input: texts
      })
    });
    if (!res.ok) {
      logger.warn("OpenAI embeddings API error", { status: res.status });
      return null;
    }
    const data = await res.json();
    return data.data.map((item) => item.embedding);
  } catch (err) {
    logger.warn("OpenAI embeddings failed", { error: String(err) });
    return null;
  }
}
__name(generateOpenAIEmbeddings, "generateOpenAIEmbeddings");
var generateEmbeddings = schemaTask({
  id: "generate-embeddings",
  schema: external_exports.object({
    knowledgeId: external_exports.string().uuid(),
    businessId: external_exports.string().uuid(),
    action: external_exports.enum(["upsert", "delete"]).default("upsert")
  }),
  retry: { maxAttempts: 3 },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { knowledgeId, businessId, action } = payload;
    const deleteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_embeddings?knowledge_id=eq.${knowledgeId}`,
      { method: "DELETE", headers: supaHeaders() }
    );
    if (!deleteRes.ok) {
      logger.error("Failed to delete old embeddings", { status: deleteRes.status });
    }
    logger.info("Deleted old embeddings", { knowledgeId });
    if (action === "delete") {
      logger.info("Delete action — done", { knowledgeId });
      return { status: "deleted", knowledgeId };
    }
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
    const fullText = `${doc.title}

${doc.content}`;
    const chunks = chunkText(fullText);
    logger.info("Chunked text", { knowledgeId, chunks: chunks.length, totalChars: fullText.length });
    const embeddings = await generateOpenAIEmbeddings(chunks);
    const hasVectors = embeddings !== null && embeddings.length === chunks.length;
    if (hasVectors) {
      logger.info("Vector embeddings generated", { model: EMBEDDING_MODEL, dims: EMBEDDING_DIMENSIONS });
    } else {
      logger.info("No OPENAI_API_KEY or API error — inserting chunks for FTS only");
    }
    const rows = chunks.map((chunk, idx) => ({
      knowledge_id: knowledgeId,
      business_id: businessId,
      chunk_index: idx,
      chunk_text: chunk,
      ...hasVectors ? { embedding: JSON.stringify(embeddings[idx]) } : {}
    }));
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/bookbot_embeddings`, {
      method: "POST",
      headers: { ...supaHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(rows)
    });
    if (!insertRes.ok) {
      const errText = await insertRes.text();
      logger.error("Failed to insert embeddings", { status: insertRes.status, error: errText });
      throw new Error(`Insert failed: ${insertRes.status} ${errText}`);
    }
    logger.info("Embeddings stored", {
      knowledgeId,
      chunks: chunks.length,
      hasVectors
    });
    return { status: "ok", knowledgeId, chunks: chunks.length, hasVectors };
  }, "run")
});
export {
  generateEmbeddings
};
//# sourceMappingURL=generate-embeddings.mjs.map
