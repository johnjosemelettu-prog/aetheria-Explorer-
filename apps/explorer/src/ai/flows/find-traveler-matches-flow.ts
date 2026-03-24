import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for finding nearby traveler matches.
 * Refactored for environment-aware execution to support static exports.
 */

const FindTravelerMatchesInputSchema = z.object({
  vibe: z.string().describe('The user\'s selected "vibe".'),
  flight: z.string().describe('The user\'s flight number.'),
  terminal: z.string().describe('The user\'s current terminal.'),
});
export type FindTravelerMatchesInput = z.infer<typeof FindTravelerMatchesInputSchema>;

const TravelerSchema = z.object({
  id: z.string(),
  name: z.string(),
  vibe: z.string(),
  onSameFlight: z.boolean(),
  avatarUrl: z.string(),
});
export type Traveler = z.infer<typeof TravelerSchema>;

const FindTravelerMatchesOutputSchema = z.array(TravelerSchema);
export type FindTravelerMatchesOutput = z.infer<typeof FindTravelerMatchesOutputSchema>;

const mockTravelers: Traveler[] = [
  { id: 'user-1', name: 'Brenda', vibe: 'Networking', onSameFlight: true, avatarUrl: 'https://i.pravatar.cc/150?u=brenda' },
  { id: 'user-2', name: 'Carlos', vibe: 'Grab a coffee', onSameFlight: false, avatarUrl: 'https://i.pravatar.cc/150?u=carlos' },
  { id: 'user-3', name: 'Dana', vibe: 'Networking', onSameFlight: true, avatarUrl: 'https://i.pravatar.cc/150?u=dana' },
];

export async function findTravelerMatches(input: FindTravelerMatchesInput): Promise<FindTravelerMatchesOutput> {
  if (typeof window !== 'undefined') {
    return mockTravelers;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    return mockTravelers;
  } catch (error) {
    console.error("Matchmaking node error:", error);
    return [];
  }
}
