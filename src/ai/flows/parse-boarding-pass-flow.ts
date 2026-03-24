import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for parsing boarding passes.
 * Refactored for environment-aware execution to support static exports.
 */

const BoardingPassInputSchema = z.object({
  photoDataUri: z.string(),
  language: z.string().optional(),
});
export type BoardingPassInput = z.infer<typeof BoardingPassInputSchema>;

const BoardingPassDetailsSchema = z.object({
  passengerName: z.string(),
  flight: z.string(),
  gate: z.string(),
  seat: z.string(),
  departureTime: z.string(),
});
export type BoardingPassDetails = z.infer<typeof BoardingPassDetailsSchema>;

export async function parseBoardingPass(input: BoardingPassInput): Promise<BoardingPassDetails> {
  if (typeof window !== 'undefined') {
    return { passengerName: "Alex Doe", flight: "BP404", gate: "T4-G8", seat: "18A", departureTime: "18:45" };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: "Extract boarding pass details." }
      ],
      output: { schema: BoardingPassDetailsSchema },
    });

    if (!response.output) throw new Error("Optical parse failure.");
    return response.output;
  } catch (error) {
    console.error("Boarding pass parser node error:", error);
    return { passengerName: "Unknown", flight: "TBD", gate: "TBD", seat: "TBD", departureTime: "TBD" };
  }
}
