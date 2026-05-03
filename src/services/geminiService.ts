import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = "gemini-3-flash-preview";

const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const jsonContent = text.substring(start, end + 1);
      try {
        return JSON.parse(jsonContent);
      } catch (innerE) {
        throw e;
      }
    }
    throw e;
  }
};

export async function chatWithGemini(messages: { role: 'user' | 'bot'; text: string }[], lang: 'te' | 'en') {
  try {
    const systemPrompt = `
      You are PestiSense Agri AI, an expert agricultural advisor specializing in tomato cultivation in Madanapalle, Andhra Pradesh, India. 
      Current language: ${lang === 'te' ? 'Telugu' : 'English'}. 
      Provide advice on plant health, pests, weather-based irrigation, and CIBRC approved pesticides.
      If recommending pesticides, strictly mention that they should be CIBRC approved.
    `;

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || '' }]
    }));

    const result = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemPrompt
      }
    });

    return result.text || '';
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    throw new Error(`AI Advisor Error: ${err.message}`);
  }
}

export async function identifyPesticide(base64Image: string, mimeType: string) {
  try {
    const prompt = `You are a pesticide identification expert. Analyze the provided image of a pesticide bottle/label.
    Extract these specific fields: 1. Product Name, 2. Active Ingredient, 3. Formulation, 4. Usage for Tomato crops, 5. Safety Warning.
    Also generate a "pesticide_id" which is a simple lowercase string of the active ingredient or brand (e.g., "mancozeb", "bayer_confidor") to match with user reviews.
    Respond STRICTLY in JSON format. Use this schema: { "name": "string", "active": "string", "form": "string", "usage": "string", "warning": "string", "pesticide_id": "string" }`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, mimeType } }
        ]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    return extractJson(result.text || '{}');
  } catch (err: any) {
    console.error("Gemini Pesticide ID Error:", err);
    return { name: "Unknown", active: "Unknown", form: "Unknown", usage: "Unknown", warning: "Please consult an expert." };
  }
}

export async function analyzeLeaf(base64Image: string, mimeType: string, location: string, growthStage: string) {
  try {
    const prompt = `Act as an expert plant pathologist specializing in Madanapalle region tomatoes.
    Analyze this image carefully. Even if the leaf is severely damaged, try to identify if it is indeed a tomato leaf.
    Location: ${location || 'Madanapalle Region'}, Stage: ${growthStage || 'General'}.
    
    If it is a tomato leaf (even diseased), set is_tomato: true.
    If it is CLEARLY not a tomato leaf (e.g., a hand, a shoe, a different plant), set is_tomato: false.

    Provide a detailed analysis in JSON format with these exact keys:
    1. is_tomato (boolean)
    2. identified_as (string - name of the plant or object detected)
    3. disease (object with "en" and "te" keys - "Healthy" if no disease)
    4. confidence (number between 0 and 100)
    5. severity (object with "en" and "te" keys: "Low", "Medium", "High", or "None")
    6. symptoms (object with "en" and "te" keys)
    7. cause (object with "en" and "te" keys)
    8. recommendations (array of objects with:
        - "brand" (string - use common Indian brands like Indofil, Bayer, etc.)
        - "activeIngredient" (string - e.g., Mancozeb, Carbendazim)
        - "reason" (object with "en" and "te" keys)
        - "dose_acre" (string)
        - "dose_15L" (string - dosage for 15 liter back sprayer)
        - "cost_acre" (number - estimated cost in INR per acre)
        - "steps" (object with "en" and "te" keys, each being an array of strings)
        - "category" (string: "fungicide", "insecticide", "fertilizer")
        - "legality" (string: "Approved")
        - "pesticide_id" (string - a simple lowercase ID like "mancozeb", "carbendazim", "copper" to link with reviews)
    )
    9. sprayTiming (object with "en" and "te" keys)
    IMPORTANT: Provide at least 2-3 recommendations ranging from low-cost to high-cost options.
    Respond ONLY with JSON.`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, mimeType } }
        ]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    return extractJson(result.text || '{}');
  } catch (err: any) {
    console.error("Gemini Leaf Analysis Error:", err);
    throw new Error(`Analysis failed: ${err.message}`);
  }
}
