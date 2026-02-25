import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";

export const webSearchTool = createTool({
  id: "web-search",
  description:
    "Search the web for information about a company, person, or topic. Use this to find prospects, research their industry, or gather competitive intelligence.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })
    ),
    success: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey || apiKey === "tvly-placeholder") {
      return { results: [], success: false, error: "TAVILY_API_KEY not configured" };
    }

    try {
      const client = tavily({ apiKey });
      const response = await client.search(inputData.query, {
        maxResults: 5,
        searchDepth: "basic",
      });

      const results = (response.results || []).map((r) => ({
        title: r.title || "",
        url: r.url || "",
        snippet: (r.content || "").slice(0, 500),
      }));

      return { results, success: true };
    } catch (err) {
      return { results: [], success: false, error: String(err) };
    }
  },
});
