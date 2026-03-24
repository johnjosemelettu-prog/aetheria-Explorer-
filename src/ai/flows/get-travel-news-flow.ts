/**
 * @fileOverview A Genkit flow for fetching the latest travel industry news.
 * Refactored for environment-aware execution to support static exports.
 */

import { 
  GetTravelNewsOutputSchema, 
  fallbackNews, 
  type GetTravelNewsOutput,
  type GetTravelNewsInput
} from './news-schemas';

/**
 * Fetches and summarizes recent travel industry news using AI.
 */
export async function getTravelNews(input?: GetTravelNewsInput): Promise<GetTravelNewsOutput> {
  if (typeof window !== 'undefined') {
    return fallbackNews;
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const currentDate = new Date().toISOString().split('T')[0];
    const threeWeeksAgoDate = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const language = input?.language || 'English';
    
    const response = await ai.generate({
      prompt: `You are an expert travel industry analyst. Today's date is ${currentDate}.
  
Your task is to find and summarize the top 5 most significant travel news stories from the past 3 weeks.

Focus on a diverse range of topics, including aviation, hospitality, travel technology, and sustainability.

CRITICAL REQUIREMENT: All news stories MUST have occurred within the last 21 days (specifically between ${threeWeeksAgoDate} and ${currentDate}). Do not include any legacy news or evergreen content.

For each story, provide a concise headline, a one-paragraph summary, the original source, a relevant category, and the approximate publication date.

**Output Language:** ${language}
All summary text and headlines MUST be written in the requested language: ${language}.

Return the result as a structured JSON object matching the requested schema.`,
      output: { schema: GetTravelNewsOutputSchema },
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (!response.output) {
      return fallbackNews;
    }

    return response.output;
  } catch (error) {
    console.error('getTravelNews AI call failed. Using fallback data.');
    return fallbackNews;
  }
}
