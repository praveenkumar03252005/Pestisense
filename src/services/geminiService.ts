import { GoogleGenAI, Type } from "@google/genai";

// Initialization according to gemini-api skill
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please provide it in AI Studio settings.');
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiModel = "gemini-3-flash-preview";

export async function chatWithGemini(messages: { role: 'user' | 'bot'; text: string }[], lang: 'te' | 'en') {
  try {
    const ai = getAI();
    
    const systemPrompt = `
      You are PestiSense Agri AI, an expert agricultural advisor specializing in tomato cultivation in Madanapalle, Andhra Pradesh, India. 
      Answer the farmer's questions in ${lang === 'te' ? 'Telugu' : 'English'}. 
      Provide scientific, practical, and safe advice. 
      The area is famous for the Madanapalle Tomato Market.
      If recommending pesticides, strictly mention that they should be CIBRC (Central Insecticides Board & Registration Committee) approved. 
      Keep answers concise, technical yet simple for a farmer.
    `;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...(messages || []).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || '' }]
      }))
    ];

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents
    });

    return response.text || '';
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    throw new Error(`Failed to communicate with AI advisor: ${err.message}`);
  }
}

export async function identifyPesticide(base64Image: string, mimeType: string) {
  try {
    const ai = getAI();
    let sanitizedImage = base64Image;
    if (sanitizedImage.includes(',')) {
      sanitizedImage = sanitizedImage.split(',')[1];
    }

    const prompt = `Identify this agricultural pesticide/fertilizer from the bottle/label shown. 
    Extract these specific fields: 1. Product Name, 2. Active Ingredient, 3. Formulation, 4. Usage for Tomato crops, 5. Safety Warning.
    Respond STRICTLY in JSON format. Use this schema: { "name": "string", "active": "string", "form": "string", "usage": "string", "warning": "string" }`;

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { data: sanitizedImage, mimeType } }
        ]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err: any) {
    console.error("Gemini Pesticide ID Error:", err);
    return { name: "Unknown", active: "Unknown", form: "Unknown", usage: "Unknown", warning: "Please consult an expert." };
  }
}

export async function analyzeLeaf(base64Image: string, mimeType: string, location: string, growthStage: string) {
  try {
    const ai = getAI();
    let sanitizedImage = base64Image;
    if (sanitizedImage.includes(',')) {
      sanitizedImage = sanitizedImage.split(',')[1];
    }

    const prompt = `You are a high-end agricultural diagnostic tool for tomato farmers in Madanapalle. 
    Analyze this image of a plant/leaf.
    Location: ${location}, Stage: ${growthStage}.

    Provide a JSON response with:
    1. is_tomato (boolean)
    2. identified_as (string)
    3. disease (object with "en" and "te" keys)
    4. severity ("Low", "Medium", or "High")
    5. confidence (number between 0 and 1)
    6. recommendations (array of objects with "brand", "activeIngredient", "reason" (object en/te), "dose_acre", "dose_15L")
    7. sprayTiming (object with "en" and "te" keys)

    Respond ONLY with the JSON object.`;

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { data: sanitizedImage, mimeType } }
        ]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error("Gemini JSON Parse Error:", parseErr, "Text:", text);
      throw new Error("Invalid response format from AI");
    }
  } catch (err: any) {
    console.error("Gemini Leaf Analysis Error:", err);
    throw new Error(`Analysis failed: ${err.message}`);
  }
}
