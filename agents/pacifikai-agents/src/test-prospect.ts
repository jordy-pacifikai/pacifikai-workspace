import "dotenv/config";
import { mastra } from "./index.js";

async function testProspector() {
  const agent = mastra.getAgent("prospectorAgent");

  console.log("\n=== TEST 1: Recherche prospect ===\n");

  // Test avec un vrai prospect potentiel en Polynésie
  const response = await agent.generate(
    `Recherche des informations sur "Le Lotus" restaurant a Tahiti.
    Je veux savoir :
    - Ce qu'ils font exactement
    - Leur presence en ligne (site web, Facebook, Instagram)
    - Les pain points potentiels qu'on pourrait resoudre avec de l'IA/automatisation
    - Un score de qualification
    - Un email d'outreach personnalise

    Sauvegarde le prospect et genere l'email.`,
    {
      resourceId: "jordy",
      threadId: "prospection-session-1",
      maxSteps: 10,
    }
  );

  console.log(response.text);

  console.log("\n=== TEST 2: Memoire persistante ===\n");

  // Deuxième requête — l'agent devrait se souvenir du contexte
  const response2 = await agent.generate(
    `Qu'est-ce que tu as appris jusqu'ici sur le secteur restauration a Tahiti ?
    Mets a jour ta base de connaissances avec ce que tu as decouvert.`,
    {
      resourceId: "jordy",
      threadId: "prospection-session-1",
      maxSteps: 5,
    }
  );

  console.log(response2.text);
}

testProspector().catch(console.error);
