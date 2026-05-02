import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiModel = "gemini-3-flash-preview";

export const getSystemPrompt = (lang: 'te' | 'en') => `
  You are PestiSense Agri AI, an expert agricultural advisor specializing in tomato cultivation in Madanapalle, Andhra Pradesh, India. 
  Answer the farmer's questions in ${lang === 'te' ? 'Telugu' : 'English'}. 
  Provide scientific, practical, and safe advice. 
  The area is famous for the Madanapalle Tomato Market.
  If recommending pesticides, strictly mention that they should be CIBRC (Central Insecticides Board & Registration Committee) approved. 
  Keep answers concise, technical yet simple for a farmer.
`;

export async function chatWithGemini(messages: { role: 'user' | 'bot'; text: string }[], lang: 'te' | 'en') {
  const contents = [
    { role: 'user', parts: [{ text: getSystemPrompt(lang) }] },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }))
  ];

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: contents as any,
  });

  return response.text;
}

export async function identifyPesticide(base64Image: string, mimeType: string) {
  const prompt = `Identify this agricultural pesticide/fertilizer from the bottle/label shown. 
  Extract these specific fields:
  1. Product Name
  2. Active Ingredient
  3. Formulation (e.g., 75% WP, 10% EC, 23% SC)
  4. Usage for Tomato crops (if mentioned or recommended)
  5. Safety Warning
  
  Respond STRICTLY in JSON format following the schema.`;

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: base64Image, mimeType } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          active: { type: Type.STRING },
          form: { type: Type.STRING },
          usage: { type: Type.STRING },
          warning: { type: Type.STRING }
        },
        required: ["name", "active", "form", "usage", "warning"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error("Failed to parse Gemini response for pesticide:", response.text);
    return { name: "Unknown", active: "Unknown", form: "Unknown", usage: "Unknown", warning: "Please consult an expert." };
  }
}

export async function analyzeLeaf(base64Image: string, mimeType: string, location: string, growthStage: string) {
  const prompt = `You are a high-end agricultural diagnostic tool for tomato farmers in Madanapalle. 
  Analyze this image of a plant/leaf.
  
  CRITICAL TASKS:
  1. Determine if the subject is a tomato plant or leaf. Be reasonably confident; even if slightly blurry, if it looks like tomato foliage, identify it as tomato.
  2. If it is clearly NOT a tomato leaf/plant, identify what it is (e.g., "Potato", "Chilli", "Rose") and set is_tomato to false.
  3. If it IS a tomato leaf/plant:
     - Identify any diseases, pests, or nutrient deficiencies (e.g., Early Blight, Late Blight, Leaf Miner, Bacterial Spot, Tuta Absoluta, Nitrogen Deficiency). 
     - Provide the disease name in both English and Telugu.
     - Estimate severity (Low, Medium, or High).
     - Provide a confidence level (0-100).
     - EXTREME IMPORTANCE: Provide EXACTLY 3 pesticide/treatment recommendations that are CIBRC approved in India.
     - FOR BEST USER EXPERIENCE, favor these specific brands if appropriate for the disease: "Amistar", "Mancozeb 75% WP", "Carbendazim 50% WP", "Ridomil Gold", "UPL Saaf".
     - Each recommendation MUST include: Brand Name (e.g., "Amistar"), Active Ingredient (e.g., "Azoxystrobin 23% SC"), a recommendation score, and a clear reason for the suggestion in both English and Telugu.
     - Provide spray timing advice (e.g. "Spray in the cool evening for best results").

  Location provided: ${location}
  Crop Growth Stage: ${growthStage}

  Respond STRICTLY in JSON format following the schema.`;

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: base64Image, mimeType } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_tomato: { type: Type.BOOLEAN },
          identified_as: { type: Type.STRING },
          disease: {
            type: Type.OBJECT,
            properties: {
              en: { type: Type.STRING },
              te: { type: Type.STRING }
            },
            required: ["en", "te"]
          },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          confidence: { type: Type.NUMBER },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                brand: { type: Type.STRING },
                activeIngredient: { type: Type.STRING },
                score: { type: Type.NUMBER },
                legality: { type: Type.STRING },
                costPerAcre: { type: Type.NUMBER },
                repeatInterval: { type: Type.STRING },
                concentration: { type: Type.STRING },
                dose_acre: { type: Type.STRING },
                dose_15L: { type: Type.STRING },
                reason: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    te: { type: Type.STRING }
                  },
                  required: ["en", "te"]
                }
              },
              required: ["brand", "activeIngredient", "reason", "dose_acre", "dose_15L"]
            }
          },
          sprayTiming: {
            type: Type.OBJECT,
            properties: {
              en: { type: Type.STRING },
              te: { type: Type.STRING }
            },
            required: ["en", "te"]
          }
        },
        required: ["is_tomato", "identified_as", "disease", "severity", "confidence", "recommendations", "sprayTiming"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data;
  } catch (err) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("The AI provided an invalid response format. Please try again.");
  }
}
