
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Message, Role } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT';
    if (!apiKey) {
      throw new Error("API Key not found in environment.");
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

      // According to guidelines, chat.sendMessageStream accepts the message parameter.
      // We pass the parts array as the message.
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
