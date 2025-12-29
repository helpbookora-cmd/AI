import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Message, Role } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    let apiKey = ""; 

    // 1. Check for Vite environment variable (VITE_API_KEY)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_API_KEY;
    } 
    // 2. Check for Create React App environment variable (REACT_APP_API_KEY)
    else if (typeof process !== 'undefined' && process.env?.REACT_APP_API_KEY) {
      apiKey = process.env.REACT_APP_API_KEY;
    }
    // 3. Check for standard Node/Webpack environment variable (API_KEY)
    else if (typeof process !== 'undefined' && process.env?.API_KEY) {
      apiKey = process.env.API_KEY;
    }
    // 4. Fallback (Only use this for local testing, do not commit real keys)
    else {
      apiKey = "AIzaSyB9qY66juXL6IXjrWStH3cUafub2ymel5Y"; // Placeholder/Fallback
    }

    if (!apiKey || apiKey === "AIzaSyB9qY66juXL6IXjrWStH3cUafub2ymel5Y") {
      console.warn("Warning: API Key is missing or using the default placeholder. Requests will likely fail.");
    }
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  private initChat() {
    this.chatSession = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });
  }

  async streamMessage(
    message: string, 
    onChunk: (text: string) => void, 
    imagePart?: { data: string; mimeType: string }
  ) {
    if (!this.chatSession) {
      this.initChat();
    }

    try {
      const parts: Part[] = [{ text: message }];
      
      if (imagePart) {
        parts.push({
          inlineData: {
            data: imagePart.data,
            mimeType: imagePart.mimeType
          }
        });
      }

      const result = await this.chatSession!.sendMessageStream({ message: parts });
      
      for await (const chunk of result) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
          onChunk(text);
        }
      }
    } catch (error) {
      console.error("Gemini Streaming Error:", error);
      throw error;
    }
  }

  resetChat() {
    this.chatSession = null;
  }
}

export const geminiService = new GeminiService();