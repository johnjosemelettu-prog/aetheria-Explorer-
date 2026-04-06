const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const localesDir = path.join(__dirname, '../src/locales');
const enPath = path.join(localesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const languages = [
  'ar', 'es', 'hi', 'ja', 'fr', 'de', 'it', 'ko', 'pt', 'ru', 'zh', 'tr', 'vi', 'th', 'nl', 'pl', 'id', 'ms'
];

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY, NEXT_PUBLIC_GEMINI_API_KEY, or API_KEY is not set');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

async function translate(targetLang) {
  const model = 'gemini-3-flash-preview';
  const prompt = `Translate the following JSON object from English to ${targetLang}. Keep the keys exactly the same. Return only the translated JSON object.\n\n${JSON.stringify(enContent, null, 2)}`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const translatedContent = JSON.parse(response.text);
    const targetPath = path.join(localesDir, `${targetLang}.json`);
    
    fs.writeFileSync(targetPath, JSON.stringify(translatedContent, null, 2));
    console.log(`Successfully translated to ${targetLang}`);
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
  }
}

async function run() {
  for (const lang of languages) {
    await translate(lang);
    // Add a small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

run();
