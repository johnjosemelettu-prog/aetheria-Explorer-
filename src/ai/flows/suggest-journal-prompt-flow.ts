import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating a creative travel journal prompt.
 * Refactored for environment-aware execution to support static exports.
 */

const SuggestJournalPromptInputSchema = z.object({
  language: z.string().optional().describe("The language for the output."),
});
export type SuggestJournalPromptInput = z.infer<typeof SuggestJournalPromptInputSchema>;

const SuggestJournalPromptOutputSchema = z.object({
  prompt: z.string().describe('A single, creative, open-ended journal prompt.'),
});
export type SuggestJournalPromptOutput = z.infer<typeof SuggestJournalPromptOutputSchema>;

export async function suggestJournalPrompt(input: SuggestJournalPromptInput): Promise<SuggestJournalPromptOutput> {
  if (typeof window !== 'undefined') {
    return {
      prompt: "If you had to describe today's mood as a color, what would it be and why?",
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const response = await ai.generate({
      prompt: `Generate one inspiring and open-ended journal prompt for a traveler. 
      Encourage reflection on feelings or senses. Output Language: ${input.language || 'English'}.`,
      output: { schema: SuggestJournalPromptOutputSchema },
    });

    if (!response.output) throw new Error('Failed to generate a journal prompt.');
    return response.output;
  } catch (error) {
    console.error("Journal prompt node error:", error);
    throw error;
  }
}
