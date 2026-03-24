
/**
 * @fileOverview A Genkit flow for converting text to speech.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

import { z } from 'zod';

const TextToSpeechInputSchema = z.string();
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a base64 data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  if (typeof window !== 'undefined') {
    return { audioDataUri: '' }; // Mock for client/Capacitor build
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const { Buffer } = await import('buffer');
    const wav = (await import('wav')).default;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Achernar' },
          },
        },
      },
      prompt: [{ text: input }],
    });

    if (!media) {
      throw new Error('No media returned from TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.substring(0, media.url.indexOf(',')).length + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer, wav);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  } catch (error) {
    console.error('TTS synthesis failed:', error);
    return { audioDataUri: '' };
  }
}

async function toWav(
  pcmData: any,
  wav: any,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d: any) {
      bufs.push(d);
    });
    writer.on('end', function () {
      const { Buffer } = require('buffer');
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
