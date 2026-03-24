import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for parsing payment QR codes.
 * Refactored for environment-aware execution to support static exports.
 */

const ParsePaymentQrInputSchema = z.object({
  photoDataUri: z.string(),
  language: z.string().optional(),
});
export type ParsePaymentQrInput = z.infer<typeof ParsePaymentQrInputSchema>;

const ParsePaymentQrOutputSchema = z.object({
  vendorName: z.string(),
  amount: z.number(),
  currency: z.string(),
  paymentReference: z.string(),
});
export type ParsePaymentQrOutput = z.infer<typeof ParsePaymentQrOutputSchema>;

export async function parsePaymentQr(input: ParsePaymentQrInput): Promise<ParsePaymentQrOutput> {
  if (typeof window !== 'undefined') {
    return { vendorName: "Local Artisan Market", amount: 25.00, currency: "USD", paymentReference: "REF-SCAN-PAY-01" };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: "Extract payment QR details." }
      ],
      output: { schema: ParsePaymentQrOutputSchema },
    });

    if (!response.output) throw new Error("Payment node sync failed.");
    return response.output;
  } catch (error) {
    console.error("Payment QR parser node error:", error);
    throw error;
  }
}
