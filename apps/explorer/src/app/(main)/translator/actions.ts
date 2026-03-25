'use server'

import { translateText, type TranslateTextInput, type TranslateTextOutput } from '@/ai/flows/translate-text-flow';
import { z } from 'zod';

export async function translateTextAction(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateText(input);
}

const AudioTranslationSchema = z.object({
  transcription: z.string().describe("The transcribed text from the audio."),
  translatedText: z.string().describe("The translation of the transcribed text."),
  detectedSourceLanguage: z.string().optional().describe("The language detected in the audio."),
});

export async function transcribeAndTranslateAudioAction(
  audioBase64: string,
  targetLanguage: string,
  sourceLanguage?: string
) {
  try {
    const { ai } = await import('@/ai/genkit');
    
    const prompt = sourceLanguage && sourceLanguage !== 'auto'
      ? `Listen to this audio. Transcribe the spoken words in ${sourceLanguage}, and then translate it into ${targetLanguage}.`
      : `Listen to this audio. Detect the language being spoken, transcribe it, and then translate it into ${targetLanguage}.`;

    const response = await ai.generate({
      prompt: prompt,
      messages: [
        {
          role: 'user',
          content: [
            { text: prompt },
            { media: { url: audioBase64 } }
          ]
        }
      ],
      output: { schema: AudioTranslationSchema },
    });
    
    return response.output;
  } catch (error) {
    console.error('Audio transcription/translation failed:', error);
    throw new Error('Failed to process audio');
  }
}
