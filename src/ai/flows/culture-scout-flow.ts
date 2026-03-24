import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for providing local cultural etiquette and social norms.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const CultureScoutInputSchema = z.object({
  city: z.string().describe("The city or country being visited."),
  scenario: z.string().optional().describe("A specific situation, e.g., 'Dining', 'Tipping', 'Greetings'."),
  language: z.string().optional().describe("The language for the output."),
});
export type CultureScoutInput = z.infer<typeof CultureScoutInputSchema>;

const CultureScoutOutputSchema = z.object({
  overview: z.string().describe("A brief summary of the local social atmosphere."),
  dos: z.array(z.string()).describe("List of positive social actions."),
  donts: z.array(z.string()).describe("List of social faux pas to avoid."),
  etiquetteTips: z.array(z.object({
    topic: z.string(),
    advice: z.string(),
  })).describe("Specific tips for various scenarios."),
  essentialPhrases: z.array(z.object({
    english: z.string(),
    local: z.string(),
    pronunciation: z.string(),
    context: z.string(),
  })).optional(),
});
export type CultureScoutOutput = z.infer<typeof CultureScoutOutputSchema>;

/**
 * Gets cultural advice. Environment-aware logic for static export.
 */
export async function getCultureAdvice(input: CultureScoutInput): Promise<CultureScoutOutput> {
  if (typeof window !== 'undefined') {
    return {
      overview: `A vibrant and respectful atmosphere in ${input.city}.`,
      dos: ["Greet elders first", "Use two hands for cards", "Remove shoes indoors"],
      donts: ["Pointing with feet", "Loud public discourse", "Tipping at traditional nodes"],
      etiquetteTips: [{ topic: "Dining", advice: "Wait for the host to initialize the meal node." }],
      essentialPhrases: [{ english: "Thank you", local: "Arigato", pronunciation: "Ah-ree-gah-toh", context: "General gratitude" }]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are an expert cultural anthropologist. Location: ${input.city}. Scenario: ${input.scenario || 'General'}. Language: ${input.language || 'English'}.`,
      output: { schema: CultureScoutOutputSchema },
    });

    if (!response.output) throw new Error('Failed to get cultural advice.');
    return response.output;
  } catch (error) {
    console.error("Culture scout node error:", error);
    throw error;
  }
}
