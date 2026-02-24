import { createTool } from "@mastra/core/tools";
import { z } from "zod";

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
  execute: async ({ inputData }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey || apiKey === "fc-placeholder") {
      return { results: [], success: false, error: "FIRECRAWL_API_KEY not configured" };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query: inputData.query,
          limit: 5,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return { results: [], success: false, error: data.error || "Search failed" };
      }

      const results = (data.data || []).map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        snippet: (r.description || r.markdown || "").slice(0, 500),
      }));

      return { results, success: true };
    } catch (err) {
      return { results: [], success: false, error: String(err) };
    }
  },
});
