import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const generateOutreachTool = createTool({
  id: "generate-outreach",
  description:
    "Generate a personalized outreach email for a prospect based on their profile and identified pain points. Returns the email subject, body, and follow-up suggestions.",
  inputSchema: z.object({
    company_name: z.string().describe("The prospect company name"),
    contact_name: z.string().optional().describe("Name of the person to address"),
    sector: z.string().describe("Business sector"),
    pain_points: z.array(z.string()).describe("Key pain points identified"),
    opportunities: z.array(z.string()).describe("Automation opportunities"),
    tone: z
      .enum(["formal", "friendly", "direct"])
      .default("friendly")
      .describe("Email tone"),
  }),
  outputSchema: z.object({
    subject: z.string(),
    body: z.string(),
    follow_up_delay_days: z.number(),
    follow_up_angle: z.string(),
  }),
  execute: async ({ inputData }) => {
    // This tool doesn't call an external API — the LLM will generate
    // the content based on the tool's output schema.
    // We return a structured template that the agent fills in.
    const contactGreeting = inputData.contact_name
      ? `Bonjour ${inputData.contact_name}`
      : "Bonjour";

    const painPointsList = inputData.pain_points
      .map((p) => `- ${p}`)
      .join("\n");
    const opportunitiesList = inputData.opportunities
      .map((o) => `- ${o}`)
      .join("\n");

    return {
      subject: `[PACIFIK'AI] Solution IA pour ${inputData.company_name}`,
      body: `${contactGreeting},

Je me permets de vous contacter car j'ai identifie des opportunites d'optimisation pour ${inputData.company_name} dans le secteur ${inputData.sector}.

Points identifies :
${painPointsList}

Solutions que nous pouvons apporter :
${opportunitiesList}

PACIFIK'AI accompagne les entreprises polynesiennes dans leur transformation digitale avec des solutions d'automatisation sur mesure.

Seriez-vous disponible pour un echange de 15 minutes cette semaine ?

Cordialement,
Jordy Toofe
PACIFIK'AI — Agence Automatisation IA
jordy@pacifikai.com | +689 89 55 81 89`,
      follow_up_delay_days: 3,
      follow_up_angle:
        "Relance avec un cas concret du meme secteur + proposition de demo gratuite",
    };
  },
});
