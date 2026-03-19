import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const geminiApiKey =
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";

const genAI = new GoogleGenerativeAI(geminiApiKey);
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const FLASH = "gemini-2.5-flash";
export const PRO = "gemini-2.5-flash";
export const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function callAI(
  model: string,
  prompt: string,
  maxOutputTokens = 2048
): Promise<string> {
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not set in .env.local");
    throw new Error("GEMINI_API_KEY missing");
  }

  try {
    const geminiModel = genAI.getGenerativeModel({ model });
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens,
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    } as unknown as Parameters<typeof geminiModel.generateContent>[0];
    const result = await geminiModel.generateContent(request);
    return result.response.text();
  } catch (err) {
    console.warn("Gemini failed, switching to Groq:", err);
    try {
      const res = await groqClient.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });
      return res.choices[0]?.message?.content ?? "";
    } catch (groqErr) {
      console.error("Groq also failed:", groqErr);
      throw new Error("Both AI providers failed");
    }
  }
}
