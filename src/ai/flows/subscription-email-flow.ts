import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for subscription emails.
 * Refactored for environment-aware execution to support static exports.
 */

const SubscriptionEmailInputSchema = z.object({
  userName: z.string(),
  tierName: z.string(),
  tripName: z.string(),
  type: z.enum(['activation', 'expiry', 'cancellation']),
  language: z.string().optional(),
});
export type SubscriptionEmailInput = z.infer<typeof SubscriptionEmailInputSchema>;

const SubscriptionEmailOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
export type SubscriptionEmailOutput = z.infer<typeof SubscriptionEmailOutputSchema>;

export async function synthesizeSubscriptionEmail(input: SubscriptionEmailInput): Promise<SubscriptionEmailOutput> {
  if (typeof window !== 'undefined') {
    return { subject: `Subscription ${input.type}`, body: "Synthesis confirmed." };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize subscription email for ${input.userName}. Type: ${input.type}.`,
      output: { schema: SubscriptionEmailOutputSchema },
    });

    if (!response.output) throw new Error("Dispatch node failure.");
    return response.output;
  } catch (error) {
    console.error("Subscription email node error:", error);
    return { subject: "Subscription Update", body: "Your status has changed." };
  }
}
