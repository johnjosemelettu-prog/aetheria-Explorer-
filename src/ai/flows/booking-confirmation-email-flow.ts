import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing personalized booking confirmation emails.
 * Re-architected for environment-aware execution to prevent Node.js module resolution errors in browser bundles.
 */

const BookingConfirmationInputSchema = z.object({
  userName: z.string().describe("The user's first name."),
  bookingType: z.enum(['flight', 'hotel', 'cruise', 'cab', 'dining', 'bus', 'train', 'insurance']),
  bookingDetails: z.any().describe("The structured booking data from Firestore."),
  language: z.string().optional().describe("The output language."),
});
export type BookingConfirmationInput = z.infer<typeof BookingConfirmationInputSchema>;

const BookingConfirmationOutputSchema = z.object({
  subject: z.string().describe("The email subject line."),
  body: z.string().describe("The full plain text body of the confirmation email."),
});
export type BookingConfirmationOutput = z.infer<typeof BookingConfirmationOutputSchema>;

/**
 * Synthesizes a booking email. Environment-aware for static export.
 */
export async function synthesizeBookingEmail(input: BookingConfirmationInput): Promise<BookingConfirmationOutput> {
  // Client-side / Capacitor guard
  if (typeof window !== 'undefined') {
    return {
      subject: `[MOCK] ${input.bookingType.toUpperCase()} Confirmation Node Resolved`,
      body: `Hello ${input.userName}, your ${input.bookingType} has been successfully synthesized in the Aetheria grid.`,
    };
  }

  // Server-side logic (Node.js environment)
  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Aetheria Odyssey Dispatcher.' 
      Synthesize a high-fidelity booking confirmation email for ${input.userName}.
      
      Booking Type: ${input.bookingType}
      Details: ${JSON.stringify(input.bookingDetails)}
      
      Requirements:
      1. Subject: Must be exciting and mention the specific ${input.bookingType} confirmation.
      2. Body: Confirm all critical details. Tone: Professional yet adventurous.
      3. Note: Mention that Ruth, the AI Assistant, is ready to help.
      4. Output Language: ${input.language || 'English'}.`,
      output: { schema: BookingConfirmationOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize booking confirmation.");
    return response.output;
  } catch (error) {
    console.error("Booking email synthesis failure:", error);
    return {
      subject: `${input.bookingType.toUpperCase()} Confirmation`,
      body: `Hello ${input.userName}, your booking is confirmed.`,
    };
  }
}
