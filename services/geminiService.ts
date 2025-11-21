import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Helper to check if API key is present
export const hasApiKey = (): boolean => !!apiKey;

// Function to format raw text into Markdown using Gemini
export const formatNoteWithAI = async (rawText: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a document formatter.
      Task: Reformat the following raw text into clean, structured Markdown.
      - Use proper headers (#, ##).
      - Use lists where appropriate.
      - Fix basic typos if obvious.
      - Do NOT add any conversational filler ("Here is your text..."). Just return the markdown.

      Raw Text:
      ${rawText}`,
    });

    return response.text || rawText;
  } catch (error) {
    console.error("Gemini formatting error:", error);
    return rawText; // Fallback to original text
  }
};

// Function to summarize a note
export const summarizeNote = async (text: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following note in 2 sentences: ${text}`,
    });
    return response.text || "Could not summarize.";
  } catch (error) {
    return "Summary unavailable.";
  }
};
