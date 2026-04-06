import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing personalized booking confirmation emails.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const BookingEmailInputSchema = z.object({
  userName: z.string().describe("The user's first name."),
  bookingType: z.string().describe("e.g., 'Flight', 'Hotel', 'Train'."),
  destination: z.string().describe("The destination of the booking."),
  language: z.string().optional().describe("The output language."),
});
export type BookingEmailInput = z.infer<typeof BookingEmailInputSchema>;

const BookingEmailOutputSchema = z.object({
  subject: z.string().describe("The email subject line."),
  body: z.string().describe("The full plain text body of the email."),
});
export type BookingEmailOutput = z.infer<typeof BookingEmailOutputSchema>;

/**
 * Synthesizes a booking confirmation email. Environment-aware for static export.
 */
export async function synthesizeBookingEmail(input: BookingEmailInput): Promise<BookingEmailOutput> {
  if (typeof window !== 'undefined') {
    return {
      subject: `Booking Confirmed: ${input.bookingType}`,
      body: `Hello ${input.userName}, your journey manifest to ${input.destination} has been updated. [MOCK]`
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a personalized booking confirmation email for ${input.userName}. Trip: ${input.bookingType} to ${input.destination}. Output Language: ${input.language || 'English'}.`,
      output: { schema: BookingEmailOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize booking email.");
    return response.output;
  } catch (error) {
    console.error("Booking email node error:", error);
    return {
      subject: `Booking Confirmed: ${input.bookingType}`,
      body: `Your journey manifest to ${input.destination} has been updated.`
    };
  }
}
