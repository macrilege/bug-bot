/**
 * Vector Database Service for Pest Control Knowledge Base
 * Handles embedding generation, vector storage, and semantic search for pest control information
 */

import { Env, PestControlSection, PestControlSearchResult } from "./types";

// Embedding model for text vectorization
const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

export class PestControlVectorService {
  constructor(private env: Env) {}

  /**
   * Initialize the vector database with pest control knowledge base
   */
  async initializeVectorDB(knowledgeData: PestControlSection[]): Promise<void> {
    console.log("Initializing pest control vector database...");
    
    // Check if already initialized
    const isAlreadyInitialized = await this.isInitialized();
    if (isAlreadyInitialized) {
      console.log("Vector database already initialized, skipping...");
      return;
    }
    
    const vectors = [];
    
    for (const section of knowledgeData) {
      try {
        // Create embeddings for the content with enhanced text
        const embeddingText = this.prepareEmbeddingText(section);
        
        console.log(`Creating embedding for: ${section.title}`);
        
        const embeddingResponse = await this.env.AI.run(EMBEDDING_MODEL, {
          text: embeddingText,
          pooling: "cls" // Use CLS pooling for better accuracy
        }) as any;

        // Check if response has the expected structure
        if (!embeddingResponse?.data?.[0]) {
          console.error(`Invalid embedding response for section ${section.id}:`, embeddingResponse);
          continue;
        }

        // Prepare vector for insertion
        const vector = {
          id: section.id,
          values: embeddingResponse.data[0],
          metadata: {
            type: section.type,
            title: section.title,
            content: section.content,
            category: section.metadata.category || "",
            keywords: section.metadata.keywords?.join(", ") || "",
            priority: section.metadata.priority || 5,
            lastUpdated: section.metadata.lastUpdated || new Date().toISOString(),
            url: section.metadata.url || "",
            location: section.metadata.location || "",
            season: section.metadata.season || "",
            pestType: section.metadata.pestType || "",
            serviceType: section.metadata.serviceType || ""
          }
        };

        vectors.push(vector);
        console.log(`Processed vector for: ${section.title}`);
        
      } catch (error) {
        console.error(`Error processing section ${section.id}:`, error);
        // Continue with other sections even if one fails
      }
    }

    // Insert vectors into Vectorize
    if (vectors.length > 0) {
      try {
        console.log(`Attempting to insert ${vectors.length} vectors...`);
        
        // Insert in smaller batches to avoid timeouts
        const batchSize = 10;
        for (let i = 0; i < vectors.length; i += batchSize) {
          const batch = vectors.slice(i, i + batchSize);
          console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vectors.length/batchSize)}`);
          
          const result = await this.env.VECTORIZE.upsert(batch);
          console.log(`Batch result:`, JSON.stringify(result, null, 2));
        }
        
        console.log(`Successfully inserted all ${vectors.length} vectors`);
        
      } catch (error) {
        console.error("Error inserting vectors:", error);
        throw error;
      }
    } else {
      throw new Error("No vectors were created from knowledge base data");
    }
  }

  /**
   * Prepare enhanced text for embedding that includes metadata
   */
  private prepareEmbeddingText(section: PestControlSection): string {
    let embeddingText = `${section.title}\n\n${section.content}`;
    
    // Add metadata context for better searchability
    if (section.metadata.category) {
      embeddingText += `\nCategory: ${section.metadata.category}`;
    }
    if (section.metadata.keywords?.length) {
      embeddingText += `\nKeywords: ${section.metadata.keywords.join(", ")}`;
    }
    if (section.metadata.pestType) {
      embeddingText += `\nPest Type: ${section.metadata.pestType}`;
    }
    if (section.metadata.serviceType) {
      embeddingText += `\nService Type: ${section.metadata.serviceType}`;
    }
    if (section.metadata.location) {
      embeddingText += `\nLocation: ${section.metadata.location}`;
    }
    if (section.metadata.season) {
      embeddingText += `\nSeason: ${section.metadata.season}`;
    }
    
    return embeddingText;
  }

  /**
   * Search for relevant pest control information based on user query
   */
  async searchKnowledgeBase(query: string, topK: number = 5): Promise<PestControlSearchResult[]> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.env.AI.run(EMBEDDING_MODEL, {
        text: query,
        pooling: "cls"
      }) as any;

      // Check if embedding response is valid
      if (!queryEmbedding?.data?.[0]) {
        console.error("Invalid query embedding response");
        return [];
      }

      // Search for similar vectors
      const searchResults = await this.env.VECTORIZE.query(
        queryEmbedding.data[0],
        {
          topK,
          returnValues: false,
          returnMetadata: "all"
        }
      );

      // Transform results into our format
      const results: PestControlSearchResult[] = searchResults.matches.map(match => ({
        content: match.metadata?.content as string || "",
        metadata: match.metadata || {},
        score: match.score
      }));

      console.log(`Found ${results.length} relevant knowledge sections for query: "${query}"`);
      return results;
      
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      return [];
    }
  }

  /**
   * Get contextual information for chat enhancement
   */
  async getRelevantContext(userMessage: string): Promise<string> {
    const searchResults = await this.searchKnowledgeBase(userMessage, 4);
    
    if (searchResults.length === 0) {
      return "";
    }

    // Filter and rank results by relevance
    const relevantResults = searchResults
      .filter(result => result.score > 0.65) // Only include high-confidence matches
      .sort((a, b) => {
        // Sort by priority and score
        const aPriority = Number(a.metadata.priority) || 5;
        const bPriority = Number(b.metadata.priority) || 5;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority; // Lower priority number = higher importance
        }
        return b.score - a.score; // Higher score first
      })
      .slice(0, 3); // Limit to top 3 results

    // Build context from search results
    const contextParts = relevantResults.map(result => {
      const metadata = result.metadata;
      let context = `${metadata.title}: ${result.content}`;
      
      // Add relevant metadata
      const additionalInfo = [];
      if (metadata.pestType) additionalInfo.push(`Pest: ${metadata.pestType}`);
      if (metadata.serviceType) additionalInfo.push(`Service: ${metadata.serviceType}`);
      if (metadata.location) additionalInfo.push(`Area: ${metadata.location}`);
      if (metadata.season) additionalInfo.push(`Season: ${metadata.season}`);
      
      if (additionalInfo.length > 0) {
        context += `\n[${additionalInfo.join(", ")}]`;
      }
      
      return context;
    });

    return contextParts.length > 0 
      ? `\n\nRelevant Knowledge Base Information:\n${contextParts.join("\n\n---\n\n")}`
      : "";
  }

  /**
   * Determine the appropriate system prompt based on query analysis
   */
  async analyzeQueryIntent(query: string): Promise<"GENERAL" | "EMERGENCY" | "QUOTE_REQUEST"> {
    const lowerQuery = query.toLowerCase();
    
    // Emergency indicators
    const emergencyKeywords = [
      "emergency", "urgent", "immediately", "asap", "help", "infestation", 
      "swarm", "nest", "bite", "sting", "allergic", "dangerous", "now",
      "invaded", "everywhere", "can't sleep", "thousands"
    ];
    
    // Quote/pricing indicators
    const quoteKeywords = [
      "price", "cost", "quote", "estimate", "how much", "pricing", 
      "fee", "charge", "rate", "affordable", "budget", "payment"
    ];
    
    if (emergencyKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return "EMERGENCY";
    }
    
    if (quoteKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return "QUOTE_REQUEST";
    }
    
    return "GENERAL";
  }

  /**
   * Check if vector database is initialized
   */
  async isInitialized(): Promise<boolean> {
    try {
      const info = await this.env.VECTORIZE.describe();
      console.log("Vector database info:", JSON.stringify(info, null, 2));
      
      // Check vectorsCount (the correct property name)
      const vectorCount = (info as any).vectorsCount || (info as any).vectorCount || (info as any).count || 0;
      return vectorCount > 0;
    } catch (error) {
      console.error("Error checking vector database status:", error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ vectorCount: number; dimensions: number }> {
    try {
      const info = await this.env.VECTORIZE.describe();
      console.log("Vector database stats info:", JSON.stringify(info, null, 2));
      
      // Check vectorsCount (the correct property name)
      const vectorCount = (info as any).vectorsCount || (info as any).vectorCount || (info as any).count || 0;
      const dimensions = (info.config && 'dimensions' in info.config) ? info.config.dimensions : 768;
      
      return { vectorCount, dimensions };
    } catch (error) {
      console.error("Error getting database stats:", error);
      return { vectorCount: 0, dimensions: 768 };
    }
  }

  /**
   * Add new knowledge to the vector database
   */
  async addKnowledge(section: PestControlSection): Promise<boolean> {
    try {
      const embeddingText = this.prepareEmbeddingText(section);
      
      const embeddingResponse = await this.env.AI.run(EMBEDDING_MODEL, {
        text: embeddingText,
        pooling: "cls"
      }) as any;

      if (!embeddingResponse?.data?.[0]) {
        console.error("Invalid embedding response for new knowledge");
        return false;
      }

      const vector = {
        id: section.id,
        values: embeddingResponse.data[0],
        metadata: {
          type: section.type,
          title: section.title,
          content: section.content,
          category: section.metadata.category || "",
          keywords: section.metadata.keywords?.join(", ") || "",
          priority: section.metadata.priority || 5,
          lastUpdated: new Date().toISOString(),
          url: section.metadata.url || "",
          location: section.metadata.location || "",
          season: section.metadata.season || "",
          pestType: section.metadata.pestType || "",
          serviceType: section.metadata.serviceType || ""
        }
      };

      await this.env.VECTORIZE.upsert([vector]);
      console.log(`Added new knowledge: ${section.title}`);
      return true;
      
    } catch (error) {
      console.error("Error adding new knowledge:", error);
      return false;
    }
  }
}
