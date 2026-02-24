import { Mastra } from "@mastra/core";
import { prospectorAgent } from "./agents/prospector.js";

export const mastra = new Mastra({
  agents: { prospectorAgent },
});

console.log("PACIFIK'AI Agent System initialized");
console.log("Available agents: prospectorAgent");
