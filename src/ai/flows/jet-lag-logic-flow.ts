import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for jet lag recovery.
 * Refactored for environment-aware execution to support static exports.
 */

const JetLagLogicInputSchema = z.object({
  departureCity: z.string(),
  arrivalCity: z.string(),
  departureDateTime: z.string(),
  arrivalDateTime: z.string(),
  language: z.string().optional(),
});
export type JetLagLogicInput = z.infer<typeof JetLagLogicInputSchema>;

const JetLagLogicOutputSchema = z.object({
  timeDifference: z.number(),
  strategy: z.string(),
  schedule: z.array(z.object({
    time: z.string(),
    action: z.string(),
    description: z.string(),
  })),
  proTips: z.array(z.string()),
});
export type JetLagLogicOutput = z.infer<typeof JetLagLogicOutputSchema>;

export async function getJetLagLogic(input: JetLagLogicInput): Promise<JetLagLogicOutput> {
  if (typeof window !== 'undefined') {
    return {
      timeDifference: 8,
      strategy: "Advance Phase",
      schedule: [{ time: "08:00 AM", action: "Bright Light Exposure", description: "Synch circadian node." }],
      proTips: ["Hydrate aggressively", "Avoid caffeine after 14:00"]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a jet lag plan for a flight from ${input.departureCity} to ${input.arrivalCity}.`,
      output: { schema: JetLagLogicOutputSchema },
    });

    if (!response.output) throw new Error("Circadian synthesis failed.");
    return response.output;
  } catch (error) {
    console.error("Jet lag logic node error:", error);
    throw error;
  }
}
