import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for searching for hotels.
 * Refactored for environment-aware execution to support static exports.
 */

const HotelSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    rating: z.number(),
    image: z.object({
        id: z.string(),
        description: z.string(),
        imageUrl: z.string(),
        imageHint: z.string(),
    }).optional(),
});
export type Hotel = z.infer<typeof HotelSchema>;

const SearchHotelsOutputSchema = z.array(HotelSchema);
export type SearchHotelsOutput = z.infer<typeof SearchHotelsOutputSchema>;

const mockHotels: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'The Grand Explorer Hotel',
    price: 250,
    rating: 4.8,
  }
];

export async function searchHotels(input: {
  destination: string;
  startDate: string;
  endDate: string;
  guests: number;
  language?: string;
}): Promise<SearchHotelsOutput> {
  if (typeof window !== 'undefined') {
    return mockHotels;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    return mockHotels;
  } catch (error) {
    console.error("Hotel search node error:", error);
    return mockHotels;
  }
}
