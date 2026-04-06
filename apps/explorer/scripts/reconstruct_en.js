const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY;

function getApiKey() {
  if (apiKey) return apiKey;
  try {
    const configPath = path.join(__dirname, "../firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      return config.apiKey;
    }
  } catch (e) {
    console.error("Failed to load API key from config:", e.message);
  }
  return null;
}

const finalApiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: finalApiKey });

async function translateJson(sourceJson) {
  const prompt = `Translate the following JSON object from Malayalam to English. 
  Keep the keys exactly the same. 
  The values should be translated into professional, futuristic English suitable for a travel app called "Aetheria". 
  Use terms like "Identity Node", "Neural Link", "Odyssey", "Grid", "Synthesis" where appropriate to maintain the brand voice.
  IMPORTANT: Ensure all variables in the values use the {{variable}} format (e.g., {{name}}, {{level}}), NOT {variable}.
  
  JSON:
  ${JSON.stringify(sourceJson, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error(`Failed to parse response for English:`, response.text);
    return null;
  }
}

async function main() {
  const localesDir = path.join(__dirname, "../src/locales");
  const mlPath = path.join(localesDir, "ml.json");
  const enPath = path.join(localesDir, "en.json");

  const mlContent = JSON.parse(fs.readFileSync(mlPath, "utf8"));
  
  console.log("Translating ml.json to en.json...");
  const enContent = await translateJson(mlContent);

  if (enContent) {
    fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2));
    console.log("Successfully updated en.json");
  } else {
    console.error("Failed to translate to English");
  }
}

main();
