/**
 * Type definitions for Bug Bot - Pest Control RAG Chat Application
 */

export interface Env {
  /**
   * Binding for the Workers AI API.
   */
  AI: Ai;

  /**
   * Binding for Cloudflare Vectorize (RAG)
   */
  VECTORIZE: VectorizeIndex;

  /**
   * Binding for static assets.
   */
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

/**
 * Represents a chat message.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Pest Control Knowledge Base Types
export interface PestControlSection {
  id: string;
  type: "service" | "pest" | "company" | "contact" | "faq" | "pricing" | "process" | "testimonial";
  title: string;
  content: string;
  metadata: {
    category?: string;
    keywords?: string[];
    priority?: number;
    lastUpdated?: string;
    url?: string;
    location?: string;
    season?: string;
    pestType?: string;
    serviceType?: string;
  };
}

export interface PestControlSearchResult {
  content: string;
  metadata: Record<string, any>;
  score: number;
}

// Common pest control queries and categories
export const PEST_CATEGORIES = {
  ANTS: "ants",
  ROACHES: "roaches", 
  SPIDERS: "spiders",
  MOSQUITOES: "mosquitoes",
  WASPS: "wasps",
  RODENTS: "rodents",
  TERMITES: "termites",
  GENERAL: "general"
} as const;

export const SERVICE_CATEGORIES = {
  RESIDENTIAL: "residential",
  COMMERCIAL: "commercial", 
  ORGANIC: "organic",
  EMERGENCY: "emergency",
  EXCLUSION: "exclusion",
  MOSQUITO_CONTROL: "mosquito_control"
} as const;

// Enhanced request interface for pest control context
export interface PestControlChatRequest {
  messages: ChatMessage[];
  context?: {
    pestType?: string;
    serviceType?: string;
    location?: string;
    urgency?: "low" | "medium" | "high" | "emergency";
  };
}

// System prompts for different contexts
export const SYSTEM_PROMPTS = {
  GENERAL: `You are BugBot, an AI assistant for Lake Highlands Pest Control. You are knowledgeable, helpful, and professional. You provide accurate information about pest control services, common pests in the Dallas/Richardson area, and help customers with their pest control needs.

Key guidelines:
- Always be helpful and professional
- Provide specific, actionable advice when possible
- Recommend contacting (972) 693-0926 for immediate assistance or service scheduling
- Emphasize that Lake Highlands Pest Control is family-owned and serves the Lake Highlands/Richardson area
- Note that the company does NOT provide termite treatments or inspections
- Promote eco-friendly and organic treatment options when relevant
- Always prioritize customer safety and satisfaction`,

  EMERGENCY: `You are BugBot, an AI assistant for Lake Highlands Pest Control. You are responding to what appears to be an URGENT pest control situation. Be helpful, reassuring, and guide the customer toward immediate action.

Key emergency guidelines:
- Acknowledge the urgency of their situation
- Provide immediate, practical safety advice
- Strongly recommend calling (972) 693-0926 for immediate assistance
- Offer basic safety measures they can take while waiting for professional help
- Reassure them that help is available`,

  QUOTE_REQUEST: `You are BugBot, an AI assistant for Lake Highlands Pest Control. The customer appears to be interested in getting a quote or pricing information. Be helpful and guide them toward scheduling a consultation.

Key guidelines for quotes:
- Explain that accurate quotes require a property inspection
- Mention that consultations are typically free
- Encourage calling (972) 693-0926 to schedule
- Provide general service category information
- Emphasize the value of professional, family-owned service`
} as const;
