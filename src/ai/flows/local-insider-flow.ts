import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for the Local Insider AI.
 * Refactored for environment-aware execution to support static exports.
 */

const LocalInsiderInputSchema = z.object({
  city: z.string(),
  query: z.string(),
  persona: z.enum(['historian', 'foodie', 'nightlife', 'minimalist']).default('historian'),
  userInterests: z.array(z.string()).optional(),
  language: z.string().optional(),
});
export type LocalInsiderInput = z.infer<typeof LocalInsiderInputSchema>;

const LocalInsiderOutputSchema = z.object({
  response: z.string(),
  recommendations: z.array(z.object({
    name: z.string(),
    reason: z.string(),
    locationType: z.string(),
  })).optional(),
});
export type LocalInsiderOutput = z.infer<typeof LocalInsiderOutputSchema>;

/**
 * Chats with local insider. Environment-aware for static export.
 */
export async function chatWithLocalInsider(input: LocalInsiderInput): Promise<LocalInsiderOutput> {
  if (typeof window !== 'undefined') {
    return {
      response: `As a local ${input.persona} in ${input.city}, I recommend looking beyond the standard landmarks. [MOCK]`,
      recommendations: [
        { name: "Hidden Node 01", reason: "Authentic local vibe.", locationType: "Secret Garden" }
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are a local ${input.persona} in ${input.city}. Answer: ${input.query}. Language: ${input.language || 'English'}.`,
      output: { schema: LocalInsiderOutputSchema },
    });

    if (!response.output) throw new Error("Insider node failure.");
    return response.output;
  } catch (error) {
    console.error("Local insider node error:", error);
    throw error;
  }
}
