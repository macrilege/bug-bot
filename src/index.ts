/**
 * Lake Highlands Pest Control RAG Chat Application
 *
 * AI-powered pest control chatbot using Cloudflare Workers AI with RAG (Retrieval Augmented Generation).
 * Integrates vector-based knowledge retrieval with LLM responses for accurate pest control information.
 *
 * @license MIT
 */
import { Env, ChatMessage, SYSTEM_PROMPTS } from "./types";
import { PestControlVectorService } from "./vector-service";
import { PEST_CONTROL_KNOWLEDGE, PEST_CONTROL_SYSTEM_PROMPT } from "./knowledge-base";

// Model ID for Workers AI model
const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

export default {
  /**
   * Main request handler for the Worker
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);


    // Handle embeddable widget script with CORS headers
    if (url.pathname === "/chat-widget.js") {
      const response = await env.ASSETS.fetch(request);
      if (response.ok) {
        // Create new response with CORS headers
        const corsResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=3600" // Cache for 1 hour
          }
        });
        return corsResponse;
      }
    }

    // Handle embeddable widget script with CORS headers (alternative name)
    if (url.pathname === "/chat.js") {
      const response = await env.ASSETS.fetch(request);
      if (response.ok) {
        // Create new response with CORS headers
        const corsResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=3600" // Cache for 1 hour
          }
        });
        return corsResponse;
      }
    }

    // Handle static assets (frontend)
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // API Routes
    if (url.pathname === "/api/chat") {
      // Handle POST and OPTIONS requests for chat (OPTIONS needed for CORS)
      if (request.method === "POST" || request.method === "OPTIONS") {
        return handleChatRequest(request, env);
      }

      // Method not allowed for other request types
      return new Response("Method not allowed", { status: 405 });
    }

    // Admin route to initialize vector database
    if (url.pathname === "/api/admin/init-vectors") {
      if (request.method === "POST") {
        return handleVectorInit(env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Admin route to check vector database status
    if (url.pathname === "/api/admin/vector-status") {
      if (request.method === "GET") {
        return handleVectorStatus(env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Admin route to add new knowledge
    if (url.pathname === "/api/admin/add-knowledge") {
      if (request.method === "POST") {
        return handleAddKnowledge(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Handle 404 for unmatched routes
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Handles chat API requests with RAG-enhanced context
 */
async function handleChatRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      }
    });
  }

  try {
    // Parse JSON request body
    const { messages = [] } = (await request.json()) as {
      messages: ChatMessage[];
    };

    // Get the latest user message for context search
    const userMessage = messages.filter(msg => msg.role === "user").pop()?.content || "";
    
    // Initialize vector service
    const vectorService = new PestControlVectorService(env);
    
    // Check if vector database is initialized
    const isInitialized = await vectorService.isInitialized();
    if (!isInitialized) {
      console.log("Vector database not initialized, initializing now...");
      await vectorService.initializeVectorDB(PEST_CONTROL_KNOWLEDGE);
    }

    // Analyze query intent to choose appropriate system prompt
    const queryIntent = await vectorService.analyzeQueryIntent(userMessage);
    const baseSystemPrompt = SYSTEM_PROMPTS[queryIntent] || PEST_CONTROL_SYSTEM_PROMPT;

    // Get relevant context from vector search
    const relevantContext = await vectorService.getRelevantContext(userMessage);
    
    // Enhanced system prompt with context
    const enhancedSystemPrompt = baseSystemPrompt + relevantContext;

    // Prepare messages with enhanced system prompt
    const enhancedMessages = [
      { role: "system" as const, content: enhancedSystemPrompt },
      ...messages.filter(msg => msg.role !== "system")
    ];

    console.log(`Processing pest control chat with ${enhancedMessages.length} messages and context length: ${relevantContext.length}`);

    const response = await env.AI.run(
      MODEL_ID,
      {
        messages: enhancedMessages,
        max_tokens: 1024,
        temperature: 0.7,
      },
      {
        returnRawResponse: true,
        // Uncomment to use AI Gateway
        // gateway: {
        //   id: "YOUR_GATEWAY_ID", // Replace with your AI Gateway ID
        //   skipCache: false,      // Set to true to bypass cache
        //   cacheTtl: 3600,        // Cache time-to-live in seconds
        // },
      },
    );

    // Add CORS headers to the streaming response
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Create new response with CORS headers
    const corsResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders
      }
    });

    return corsResponse;
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { 
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  }
}

/**
 * Initialize the vector database with pest control knowledge
 */
async function handleVectorInit(env: Env): Promise<Response> {
  try {
    const vectorService = new PestControlVectorService(env);
    await vectorService.initializeVectorDB(PEST_CONTROL_KNOWLEDGE);
    
    const stats = await vectorService.getStats();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Pest control vector database initialized successfully",
        stats,
        knowledgeEntriesLoaded: PEST_CONTROL_KNOWLEDGE.length
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error initializing vector database:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to initialize vector database" 
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" }
      }
    );
  }
}

/**
 * Get vector database status and statistics
 */
async function handleVectorStatus(env: Env): Promise<Response> {
  try {
    const vectorService = new PestControlVectorService(env);
    const isInitialized = await vectorService.isInitialized();
    const stats = await vectorService.getStats();
    
    return new Response(
      JSON.stringify({
        initialized: isInitialized,
        stats,
        totalKnowledgeEntries: PEST_CONTROL_KNOWLEDGE.length,
        systemInfo: {
          embeddingModel: "@cf/baai/bge-base-en-v1.5",
          chatModel: MODEL_ID,
          knowledgeBaseVersion: "1.0"
        }
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error getting vector status:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to get vector database status" 
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" }
      }
    );
  }
}

/**
 * Add new knowledge to the vector database
 */
async function handleAddKnowledge(request: Request, env: Env): Promise<Response> {
  try {
    const knowledgeSection = await request.json() as any;
    
    // Validate the knowledge section structure
    if (!knowledgeSection.id || !knowledgeSection.title || !knowledgeSection.content) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid knowledge section format" 
        }),
        {
          status: 400,
          headers: { "content-type": "application/json" }
        }
      );
    }

    const vectorService = new PestControlVectorService(env);
    const success = await vectorService.addKnowledge(knowledgeSection);
    
    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Knowledge added successfully",
          id: knowledgeSection.id
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to add knowledge" 
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error adding knowledge:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to process knowledge addition" 
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" }
      }
    );
  }
}
