import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../../constants/env";

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface WasteAnalysisResult {
  materials: Array<{
    materialType: string;
    confidence: number;
    estimatedWeight: number;
    estimatedValue: number;
  }>;
  totalWeight: number;
  totalValue: number;
  category: "plastic" | "metal" | "paper" | "glass" | "electronic" | "mixed";
  description: string;
}

export const analyzeWasteImage = async (
  imageUrl: string,
  currency: string = "LKR",
  country: string = "Sri Lanka",
): Promise<WasteAnalysisResult> => {
  try {
    const prompt = `Analyze this waste/scrap material image and provide a detailed breakdown in JSON format.
    
    Context:
    - Location: ${country}
    - Currency: ${currency}

    Instructions:
    1. Identify the materials present in the image.
    2. Estimate the weight of each material.
    3. Estimate the value of each material based on CURRENT market rates in ${country} in ${currency}.
    
    Output Format (JSON ONLY):
{
  "materials": [
    {
      "materialType": "type of material (e.g., PET plastic, aluminum, cardboard)",
      "confidence": 0-100,
      "estimatedWeight": weight in kg,
      "estimatedValue": estimated value in ${currency}
    }
  ],
  "totalWeight": total estimated weight in kg,
  "totalValue": total estimated value in ${currency},
  "category": "plastic" | "metal" | "paper" | "glass" | "electronic" | "mixed",
  "description": "A short, concise description of the waste items"
}

Respond with ONLY valid JSON, no additional text.`;

    const imagePart = {
      inlineData: {
        data: await fetchImageAsBase64(imageUrl),
        mimeType: "image/jpeg",
      },
    };

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            imagePart,
          ],
        },
      ],
    });

    const responseText = result?.text || "";

    //* Clean the response that given by the AI
    const cleanedResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis: WasteAnalysisResult = JSON.parse(cleanedResponse);

    return analysis;
  } catch (error) {
    console.error("Gemini Vision API error:", error);
    throw new Error("Failed to analyze waste image");
  }
};

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}
