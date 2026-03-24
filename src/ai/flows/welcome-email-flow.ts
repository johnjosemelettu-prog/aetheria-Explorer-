import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for welcome emails.
 * Refactored for environment-aware execution to support static exports.
 */

const WelcomeEmailInputSchema = z.object({
  firstName: z.string(),
  language: z.string().optional(),
});
export type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;

const WelcomeEmailOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
export type WelcomeEmailOutput = z.infer<typeof WelcomeEmailOutputSchema>;

/**
 * Synthesizes a welcome email. Environment-aware for static export.
 */
export async function synthesizeWelcomeEmail(input: WelcomeEmailInput): Promise<WelcomeEmailOutput> {
  if (typeof window !== 'undefined') {
    return { 
      subject: "Welcome to Aetheria", 
      body: `Hello ${input.firstName}, your journey starts now. [MOCK]` 
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a welcome email for ${input.firstName}. Language: ${input.language || 'English'}.`,
      output: { schema: WelcomeEmailOutputSchema },
    });

    if (!response.output) throw new Error("Welcome dispatcher node failure.");
    return response.output;
  } catch (error) {
    console.error("Welcome email node error:", error);
    return { subject: "Welcome to Aetheria", body: "Your journey starts now." };
  }
}
