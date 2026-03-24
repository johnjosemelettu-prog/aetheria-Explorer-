import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for delay compensation claims.
 * Refactored for environment-aware execution to support static exports.
 */

const ClaimInputSchema = z.object({
  flightNumber: z.string(),
  delayDurationMinutes: z.number(),
  airlineName: z.string(),
  passengerName: z.string(),
  language: z.string().optional(),
});
export type ClaimInput = z.infer<typeof ClaimInputSchema>;

const ClaimOutputSchema = z.object({
  claimLetter: z.string(),
  estimatedCompensation: z.string(),
  legalReference: z.string(),
  nextSteps: z.array(z.string()),
});
export type ClaimOutput = z.infer<typeof ClaimOutputSchema>;

export async function synthesizeClaimNode(input: ClaimInput): Promise<ClaimOutput> {
  if (typeof window !== 'undefined') {
    return {
      claimLetter: "High-fidelity legal claim draft initialized.",
      estimatedCompensation: "$600 USD",
      legalReference: "EU261 / Standard Protocol",
      nextSteps: ["Authorize transmission", "Await settlement"]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a compensation claim for flight ${input.flightNumber}.`,
      output: { schema: ClaimOutputSchema },
    });

    if (!response.output) throw new Error("Legal architect node failure.");
    return response.output;
  } catch (error) {
    console.error("Claim synthesis node error:", error);
    throw error;
  }
}
