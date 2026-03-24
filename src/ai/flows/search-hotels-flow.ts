import { z } from 'zod';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview A Genkit flow for searching for hotels.
 * Refactored for environment-aware execution to support static exports.
 */

const SearchHotelsInputSchema = z.object({
  destination: z.string().describe('The travel destination city.'),
  startDate: z.string().describe('The check-in date in YYYY-MM-DD format.'),
  endDate: z.string().describe('The check-out date in YYYY-MM-DD format.'),
  guests: z.number().describe('The number of guests.'),
  language: z.string().optional().describe('The target language for results.'),
});
export type SearchHotelsInput = z.infer<typeof SearchHotelsInputSchema>;

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

const placeholderHotels = [
  {
    id: 'hotel-1',
    name: 'The Grand Explorer Hotel',
    price: 250,
    rating: 4.8,
    image: PlaceHolderImages.find((img) => img.id === 'hotel-1'),
  },
  {
    id: 'hotel-2',
    name: 'Oasis Poolside Resort',
    price: 180,
    rating: 4.5,
    image: PlaceHolderImages.find((img) => img.id === 'hotel-2'),
  },
  {
    id: 'hotel-3',
    name: 'The Continental Breakfast Inn',
    price: 120,
    rating: 4.2,
    image: PlaceHolderImages.find((img) => img.id === 'hotel-3'),
  },
];

export async function searchHotels(input: SearchHotelsInput): Promise<SearchHotelsOutput> {
  if (typeof window !== 'undefined') {
    return placeholderHotels;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate the following list of hotel nodes into ${input.language}. 
        Return ONLY the JSON array matching the schema. 
        Translate hotel names and keep numeric values/IDs intact.
        
        DATA: ${JSON.stringify(placeholderHotels)}`,
        output: { schema: SearchHotelsOutputSchema },
      });
      return response.output || placeholderHotels;
    }

    return placeholderHotels;
  } catch (error) {
    console.error("Hotel search node error:", error);
    return placeholderHotels;
  }
}
