/**
 * @fileOverview A Genkit flow for generating personalized city scavenger hunts.
 */

import { z } from 'zod';

const ExplorerQuestInputSchema = z.object({
  city: z.string().describe("The city for the scavenger hunt."),
  interests: z.array(z.string()).optional().describe("User interests to tailor the quests."),
  language: z.string().optional().describe("The language for the output."),
});
export type ExplorerQuestInput = z.infer<typeof ExplorerQuestInputSchema>;

const ExplorerQuestOutputSchema = z.object({
  title: z.string().describe("A catchy name for the quest."),
  description: z.string().describe("An encouraging intro for the traveler."),
  quests: z.array(z.object({
    id: z.string(),
    task: z.string().describe("The specific thing the user needs to find or do."),
    hint: z.string().describe("A cryptic or helpful hint to find the location."),
    category: z.enum(['Art', 'History', 'Culinary', 'Nature', 'Hidden Gem']),
    points: z.number().describe("Points awarded for completion."),
  })),
});
export type ExplorerQuestOutput = z.infer<typeof ExplorerQuestOutputSchema>;

export async function generateExplorerQuest(input: ExplorerQuestInput): Promise<ExplorerQuestOutput> {
  if (typeof window !== 'undefined') {
    return {
      title: `Kyoto Discovery Mission`,
      description: "Unlock the secrets of the ancient capital with these high-fidelity quests.",
      quests: [
        { id: 'q1', task: "Find the hidden Zen garden behind the Golden Pavilion.", hint: "Look for the small bamboo gate to the north.", category: 'Hidden Gem', points: 50 },
        { id: 'q2', task: "Sample authentic Uji Matcha at a traditional tea house.", hint: "Follow the scent of toasted leaves near Gion.", category: 'Culinary', points: 30 }
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the "Backpacker Quest Master." Your goal is to turn city exploration into a fun scavenger hunt.
      Destination: ${input.city}
      Interests: ${input.interests?.join(', ') || 'General'}
      Output Language: ${input.language || 'English'}.`,
      output: { schema: ExplorerQuestOutputSchema },
    });

    if (!response.output) throw new Error('Failed to generate quests.');
    return response.output;
  } catch (error) {
    console.error("Explorer quest synthesis failed:", error);
    throw error;
  }
}
