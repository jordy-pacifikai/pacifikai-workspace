import { createTool } from "@mastra/core/tools";
import { z } from "zod";

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
  execute: async ({ inputData }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey || apiKey === "fc-placeholder") {
      return {
        title: "",
        content: "",
        success: false,
        error: "FIRECRAWL_API_KEY not configured",
      };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: inputData.url,
          formats: ["markdown"],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return {
          title: "",
          content: "",
          success: false,
          error: data.error || "Scrape failed",
        };
      }

      return {
        title: data.data?.metadata?.title || "",
        content: (data.data?.markdown || "").slice(0, 8000),
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
