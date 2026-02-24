import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const saveProspectTool = createTool({
  id: "save-prospect",
  description:
    "Save a prospect's information to the database (Supabase). Use this after researching a prospect to store their profile for follow-up.",
  inputSchema: z.object({
    company_name: z.string().describe("The company name"),
    sector: z.string().describe("Business sector (e.g., restauration, hotellerie, automobile)"),
    website: z.string().url().optional().describe("Company website URL"),
    contact_name: z.string().optional().describe("Primary contact name"),
    contact_email: z.string().email().optional().describe("Contact email"),
    contact_phone: z.string().optional().describe("Contact phone number"),
    pain_points: z.array(z.string()).describe("Identified pain points"),
    opportunities: z.array(z.string()).describe("Automation/AI opportunities identified"),
    score: z.number().min(1).max(10).describe("Prospect score 1-10 (10 = highest potential)"),
    notes: z.string().describe("Free-form research notes"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseKey === "placeholder") {
      // Fallback: log to console for testing
      console.log("\n=== PROSPECT SAVED (local mode) ===");
      console.log(JSON.stringify(inputData, null, 2));
      console.log("===================================\n");
      return { success: true, id: `local-${Date.now()}` };
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/prospects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          ...inputData,
          pain_points: inputData.pain_points,
          opportunities: inputData.opportunities,
          created_at: new Date().toISOString(),
          status: "new",
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: err };
      }

      const [record] = await response.json();
      return { success: true, id: record?.id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
