import axios from 'axios';

export const geminiModel = "gemini-1.5-flash";

export async function chatWithGemini(messages: { role: 'user' | 'bot'; text: string }[], lang: 'te' | 'en') {
  try {
    const response = await axios.post('/api/gemini/chat', { messages, lang });
    return response.data.text;
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    throw new Error(`Failed to communicate with AI advisor: ${err.response?.data?.error || err.message}`);
  }
}

export async function identifyPesticide(base64Image: string, mimeType: string) {
  try {
    const response = await axios.post('/api/gemini/identify-pesticide', { image: base64Image, mimeType });
    return response.data;
  } catch (err: any) {
    console.error("Gemini Pesticide ID Error:", err);
    return { name: "Unknown", active: "Unknown", form: "Unknown", usage: "Unknown", warning: "Please consult an expert." };
  }
}

export async function analyzeLeaf(base64Image: string, mimeType: string, location: string, growthStage: string) {
  try {
    const response = await axios.post('/api/gemini/analyze-leaf', { 
      image: base64Image, 
      mimeType, 
      location, 
      growthStage 
    });
    return response.data;
  } catch (err: any) {
    console.error("Gemini Leaf Analysis Error:", err);
    throw new Error(`Analysis failed: ${err.response?.data?.error || err.message}`);
  }
}
