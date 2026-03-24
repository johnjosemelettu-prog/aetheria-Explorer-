import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating an audio tour script.
 * Refactored for environment-aware execution to support static exports.
 */

const GenerateTourScriptInputSchema = z.object({
  poiName: z.string(),
  language: z.string(),
});
export type GenerateTourScriptInput = z.infer<typeof GenerateTourScriptInputSchema>;

const GenerateTourScriptOutputSchema = z.object({
    script: z.string(),
});
export type GenerateTourScriptOutput = z.infer<typeof GenerateTourScriptOutputSchema>;

export async function generateTourScript(input: GenerateTourScriptInput): Promise<GenerateTourScriptOutput> {
  if (typeof window !== 'undefined') {
    return {
      script: `Welcome to ${input.poiName}. This historical node is a high-fidelity representation of local cultural evolution.`,
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Generate an engaging 2-paragraph audio tour script for ${input.poiName} in ${input.language}.`,
      output: { schema: GenerateTourScriptOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize tour script.");
    return response.output;
  } catch (error) {
    console.error("Tour script node error:", error);
    throw error;
  }
}
