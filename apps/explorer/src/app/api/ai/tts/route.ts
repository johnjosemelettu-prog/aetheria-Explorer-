
import { NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

/**
 * @fileOverview Server-side Linguistic Synthesis Node.
 * Converts text to WAV audio using Gemini 2.5 Flash TTS.
 */

process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;

const ai = genkit({
  plugins: [googleAI()],
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Missing text node" }, { status: 400 });

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media || !media.url) throw new Error('Linguistic synthesis node returned no data.');

    const base64Data = media.url.substring(media.url.indexOf(',') + 1);
    const pcmBuffer = Buffer.from(base64Data, 'base64');
    const wavBase64 = await toWav(pcmBuffer);

    return NextResponse.json({
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    });
  } catch (error: any) {
    console.error("TTS Synthesis Failure:", error);
    return NextResponse.json({ error: "Linguistic node failure" }, { status: 500 });
  }
}

async function toWav(
  pcmData: Buffer,
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

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}
