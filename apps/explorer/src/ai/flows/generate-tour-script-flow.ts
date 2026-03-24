
/**
 * @fileOverview A script generator for high-fidelity audio tours.
 */

import { z } from 'zod';

const GenerateTourScriptInputSchema = z.object({
  poiName: z.string(),
  language: z.string(),
});
export type GenerateTourScriptInput = z.infer<typeof GenerateTourScriptInputSchema>;

const GenerateTourScriptOutputSchema = z.object({
    script: z.string().describe("The tour narration script."),
});
export type GenerateTourScriptOutput = z.infer<typeof GenerateTourScriptOutputSchema>;

export async function generateTourScript(input: GenerateTourScriptInput): Promise<GenerateTourScriptOutput> {
  if (typeof window !== 'undefined') {
    return {
      script: `Welcome to ${input.poiName}. This historical node represents a peak in local architectural synthesis. Observe the structural logic of the central arch...`,
    };
  }

  const { ai } = await import('@/ai/genkit');
  const { output } = await ai.generate({
    prompt: `You are a high-fidelity tour guide. Generate an engaging 2-paragraph audio tour script for ${input.poiName}.
    The tone should be sophisticated, insightful, and immersive.
    Output Language: ${input.language}.`,
    output: { schema: GenerateTourScriptOutputSchema },
  });

  return output!;
}
