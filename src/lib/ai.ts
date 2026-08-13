/**
 * ============================================================================
 * MODULE PURPOSE: Multi-Provider LLM Client (Groq LPU API + Ollama Fallback)
 * RESPONSIBILITIES:
 *  - Interfacing with Groq API (llama-3.3-70b-versatile) for ultra-fast ~300ms inference.
 *  - Fallback to local Ollama server running gemma4:cloud model.
 *  - Auto-reparative JSON cleaning & repair for robust extraction.
 * OWNS: LLM completion calls, JSON auto-repair, and provider selection.
 * SHOULD NOT OWN: Domain business logic or database persistence operations.
 * ============================================================================
 */

import OpenAI from "openai";

export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:cloud";

// Initialize OpenAI client targeting Groq API when key is present, otherwise Ollama
export const ai = GROQ_API_KEY
  ? new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: GROQ_API_KEY,
    })
  : new OpenAI({
      baseURL: OLLAMA_BASE_URL,
      apiKey: "ollama",
    });

export const ACTIVE_MODEL = GROQ_API_KEY ? GROQ_MODEL : OLLAMA_MODEL;

export class AIService {
  static cleanJsonText(text: string): string {
    if (!text) return '{}';
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/gi, '').replace(/\s*```$/gi, '').trim();
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace === -1) return '{}';
    cleaned = cleaned.substring(firstBrace);
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace > 0) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }
    return cleaned;
  }

  static safeParseJson<T = any>(text: string, fallback: T): T {
    try {
      const cleaned = AIService.cleanJsonText(text);
      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      console.warn("⚠️ [AIService] Direct JSON parse failed, attempting auto-repair. Error:", err.message);
      try {
        let repaired = AIService.cleanJsonText(text);
        if ((repaired.match(/"/g) || []).length % 2 !== 0) {
          repaired += '"';
        }
        let openBraces = (repaired.match(/\{/g) || []).length;
        let closeBraces = (repaired.match(/\}/g) || []).length;
        while (openBraces > closeBraces) {
          repaired += '}';
          closeBraces++;
        }
        let openBrackets = (repaired.match(/\[/g) || []).length;
        let closeBrackets = (repaired.match(/\]/g) || []).length;
        while (openBrackets > closeBrackets) {
          repaired += ']';
          closeBrackets++;
        }
        return JSON.parse(repaired) as T;
      } catch (repairErr: any) {
        console.warn("⚠️ [AIService] Auto-repair failed. Returning safe fallback object.");
        return fallback;
      }
    }
  }

  /**
   * Generates a text or structured JSON completion using Groq LPU API / Ollama fallback.
   */
  static async generateCompletion(prompt: string, isJson: boolean = false): Promise<string> {
    const providerName = GROQ_API_KEY ? `Groq API (${GROQ_MODEL})` : `Ollama (${OLLAMA_MODEL})`;
    console.log(`⚡ [AIService] Sending prompt to ${providerName}...`);

    let finalPrompt = prompt;
    if (isJson && !prompt.toLowerCase().includes('json')) {
      finalPrompt = `${prompt}\n\nPlease output the result in valid JSON format.`;
    }

    const options: any = {
      model: ACTIVE_MODEL,
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0.4,
    };

    if (isJson) {
      options.response_format = { type: "json_object" };
    }

    try {
      const response = await ai.chat.completions.create(options);
      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error(`${providerName} returned an empty response.`);
      }
      console.log(`✅ [AIService] Received ultra-fast response from ${providerName} (${text.length} chars)`);
      return isJson ? AIService.cleanJsonText(text) : text;
    } catch (error: any) {
      console.warn(`⚠️ [AIService] Completion request failed (${ACTIVE_MODEL}):`, error.message || error);
      throw error;
    }
  }

  /**
   * Generates a conversational chat response using chat history.
   */
  static async generateChatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
    const providerName = GROQ_API_KEY ? `Groq API (${GROQ_MODEL})` : `Ollama (${OLLAMA_MODEL})`;
    console.log(`⚡ [AIService] Chat request with ${messages.length} messages -> ${providerName}...`);

    try {
      const response = await ai.chat.completions.create({
        model: ACTIVE_MODEL,
        messages: messages as any,
        temperature: 0.5,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error(`${providerName} returned an empty chat response.`);
      }
      return text;
    } catch (error: any) {
      console.warn(`⚠️ [AIService] Chat completion failed (${ACTIVE_MODEL}):`, error.message || error);
      throw error;
    }
  }
}
