import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing personalized gear purchase confirmation emails.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const GearPurchaseEmailInputSchema = z.object({
  userName: z.string().describe("The user's first name."),
  itemName: z.string().describe("The name of the gear purchased."),
  category: z.string().describe("The category of the gear."),
  price: z.number().describe("The purchase price."),
  language: z.string().optional().describe("The output language."),
});
export type GearPurchaseEmailInput = z.infer<typeof GearPurchaseEmailInputSchema>;

const GearPurchaseEmailOutputSchema = z.object({
  subject: z.string().describe("The email subject line."),
  body: z.string().describe("The full plain text body of the email."),
});
export type GearPurchaseEmailOutput = z.infer<typeof GearPurchaseEmailOutputSchema>;

/**
 * Synthesizes gear purchase email. Environment-aware logic for static export.
 */
export async function synthesizeGearPurchaseEmail(input: GearPurchaseEmailInput): Promise<GearPurchaseEmailOutput> {
  if (typeof window !== 'undefined') {
    return {
      subject: "Arsenal Updated: Gear Secured",
      body: `Hello ${input.userName}, your ${input.itemName} has been added to your explorer library. [MOCK]`
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a gear purchase email for ${input.userName}. Item: ${input.itemName}. Language: ${input.language || 'English'}.`,
      output: { schema: GearPurchaseEmailOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize gear purchase email.");
    return response.output;
  } catch (error) {
    console.error("Gear email node error:", error);
    throw error;
  }
}
