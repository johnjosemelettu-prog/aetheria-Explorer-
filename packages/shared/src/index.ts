
import { z } from 'zod';

/**
 * @fileOverview Universal schemas shared across the Aetheria grid.
 * Zero-dependency nodes for cross-application type safety.
 */

export const ItinerarySchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  interests: z.array(z.string()),
  budget: z.enum(['low', 'medium', 'high']),
  vibe: z.string().optional(),
});

export type ItineraryInput = z.infer<typeof ItinerarySchema>;

export const ItineraryOutputSchema = z.object({
  summary: z.string(),
  dailyPlans: z.array(z.object({
    date: z.string(),
    theme: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      description: z.string()
    }))
  }))
});

export type ItineraryOutput = z.infer<typeof ItineraryOutputSchema>;

// Add other shared schemas here...
