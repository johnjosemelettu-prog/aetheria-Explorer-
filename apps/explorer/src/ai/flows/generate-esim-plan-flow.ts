/**
 * @fileOverview A Genkit flow for generating a co-branded eSIM data plan based on trip parameters.
 * Re-architected for environment-aware execution to support static exports.
 */

import { z } from 'zod';

const GenerateEsimPlanInputSchema = z.object({
  destination: z.string().describe("The travel destination country or region."),
  durationDays: z.number().describe("The length of the stay."),
  language: z.string().optional(),
});
export type GenerateEsimPlanInput = z.infer<typeof GenerateEsimPlanInputSchema>;

const GenerateEsimPlanOutputSchema = z.object({
  providerName: z.string().describe("Co-branded provider name (e.g., 'Aetheria x Airalo')."),
  planName: z.string().describe("The name of the data plan."),
  dataLimitGb: z.number().describe("Amount of data in GB."),
  priceUsd: z.number().describe("The price of the plan in USD."),
  networkType: z.string().describe("e.g., '5G / LTE'"),
  features: z.array(z.string()).describe("List of plan benefits."),
});
export type GenerateEsimPlanOutput = z.infer<typeof GenerateEsimPlanOutputSchema>;

/**
 * Generates a co-branded eSIM plan using AI.
 * Incorporates a fallback mechanism to prevent UI failure during rate-limiting or client-side execution.
 */
export async function generateEsimPlan(input: GenerateEsimPlanInput): Promise<GenerateEsimPlanOutput> {
  // Client-side / Capacitor guard
  if (typeof window !== 'undefined') {
    return getEsimFallbackPlan(input);
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const response = await ai.generate({
      prompt: `You are the 'Aetheria AI Connectivity Agent.' 
      Synthesize a premium co-branded eSIM data plan for a traveler visiting ${input.destination} for ${input.durationDays} days.
      
      Requirements:
      1. Provider Name: Must be "Aetheria x [Global Telco]".
      2. Plan Name: A catchy name like "Tokyo Turbo" or "Parisian Pulse".
      3. Data Limit: Suggest 5, 10, or 20 GB based on duration.
      4. Price: Competitive market rate ($10-$45).
      5. Output in ${input.language || 'English'}.`,
      output: { schema: GenerateEsimPlanOutputSchema },
    });

    if (!response.output) throw new Error("Synthesis node returned empty data.");
    return response.output;
  } catch (error) {
    console.warn("[AETHERIA AI] eSIM synthesis node error. Deploying verified fallback plan.", error);
    return getEsimFallbackPlan(input);
  }
}

/**
 * Provides a high-fidelity standard plan when AI services are offline or in client-side mode.
 */
function getEsimFallbackPlan(input: GenerateEsimPlanInput): GenerateEsimPlanOutput {
  const gb = input.durationDays > 14 ? 20 : input.durationDays > 7 ? 10 : 5;
  const price = gb * 2 + 5;
  return {
    providerName: "Aetheria x Airalo",
    planName: `${input.destination} Global Connect`,
    dataLimitGb: gb,
    priceUsd: price,
    networkType: "5G / LTE",
    features: [
      "Instant activation via QR node",
      "Zero roaming overhead",
      "Localized high-speed data"
    ]
  };
}
