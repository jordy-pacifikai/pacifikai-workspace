import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";

export const scrapeWebsiteTool = createTool({
  id: "scrape-website",
  description:
    "Scrape a website URL to extract its content, business info, services, and contact details. Use this to research a prospect's website.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the website to scrape"),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    success: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey || apiKey === "tvly-placeholder") {
      return {
        title: "",
        content: "",
        success: false,
        error: "TAVILY_API_KEY not configured",
      };
    }

    try {
      const client = tavily({ apiKey });
      const response = await client.extract([inputData.url]);

      const result = response.results?.[0];
      if (!result) {
        return {
          title: "",
          content: "",
          success: false,
          error: "No content extracted",
        };
      }

      return {
        title: result.url || "",
        content: (result.rawContent || "").slice(0, 8000),
        success: true,
      };
    } catch (err) {
      return {
        title: "",
        content: "",
        success: false,
        error: String(err),
      };
    }
  },
});
