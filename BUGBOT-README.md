# 🐛 BugBot - Lake Highlands Pest Control RAG Chat Application

An AI-powered pest control chatbot using Cloudflare Workers AI with RAG (Retrieval Augmented Generation). This application provides intelligent responses about pest control services by combining an LLM with a vector-based knowledge retrieval system.

## 🏆 Features

- **RAG-Enhanced Responses**: Vector-based knowledge retrieval for accurate pest control information
- **Real-time Chat Interface**: Streaming responses with modern, pest control-themed UI
- **Intelligent Context Detection**: Automatically detects emergency situations, quote requests, and general inquiries
- **Comprehensive Knowledge Base**: Structured data about Lake Highlands Pest Control services
- **Mobile-Responsive Design**: Works perfectly on desktop and mobile devices
- **CORS-Enabled**: Can be embedded as a widget on external websites

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Cloudflare Workers (TypeScript)
- **AI Models**: 
  - Chat: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
  - Embeddings: `@cf/baai/bge-base-en-v1.5`
- **Vector Database**: Cloudflare Vectorize
- **Knowledge Base**: Structured TypeScript data with metadata

## 🚀 Quick Start

### Prerequisites

1. **Cloudflare Account** with Workers and AI enabled
2. **Node.js** 18+ and npm
3. **Wrangler CLI** installed globally:
   ```bash
   npm install -g wrangler
   ```

### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo-url>
   cd bug-bot
   npm install
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler auth login
   ```

3. **Create Vectorize Index**
   ```bash
   wrangler vectorize create pest-control-knowledge --dimensions=768 --metric=cosine
   ```

4. **Update wrangler.jsonc**
   Make sure your `wrangler.jsonc` includes the vectorize binding:
   ```jsonc
   {
     "vectorize": [
       {
         "binding": "VECTORIZE",
         "index_name": "pest-control-knowledge"
       }
     ]
   }
   ```

5. **Deploy to Cloudflare Workers**
   ```bash
   npm run deploy
   ```

### Development

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Initialize Vector Database**
   Open the browser console and run:
   ```javascript
   initializeVectorDB()
   ```

3. **Check Vector Database Status**
   ```javascript
   checkVectorStatus()
   ```

## 📁 Project Structure

```
bug-bot/
├── src/
│   ├── index.ts              # Main Worker entry point with RAG integration
│   ├── types.ts              # TypeScript type definitions
│   ├── vector-service.ts     # Vector database service for RAG
│   └── knowledge-base.ts     # Pest control knowledge base data
├── public/
│   ├── index.html           # Pest control-themed chat interface
│   └── chat.js              # Enhanced frontend with error handling
├── package.json             # Dependencies and scripts
├── wrangler.jsonc          # Cloudflare Workers configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎯 Key Components

### Vector Service (`vector-service.ts`)
- Handles embedding generation for knowledge base
- Provides semantic search capabilities
- Manages vector database operations
- Analyzes query intent (emergency, quote, general)

### Knowledge Base (`knowledge-base.ts`)
- Structured pest control information
- Company details and service offerings
- Common pest information for Texas
- Seasonal pest activity data
- FAQ and pricing information

### Chat Interface (`index.html` + `chat.js`)
- Modern, pest control-themed design
- Quick question buttons for common inquiries
- Real-time streaming responses
- Enhanced error handling and offline detection
- Mobile-responsive layout

## 🔧 Configuration

### Environment Variables
Set these in your Cloudflare Workers dashboard or via wrangler:

- `AI_GATEWAY_ID` (optional): Your AI Gateway ID for caching and analytics

### Customization

1. **Knowledge Base**: Edit `src/knowledge-base.ts` to update pest control information
2. **Styling**: Modify CSS variables in `public/index.html` for different themes
3. **Models**: Change AI models in `src/index.ts` and `src/vector-service.ts`

## 📊 API Endpoints

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Do you treat ants?"}
  ]
}
```

### Admin Endpoints

#### Initialize Vector Database
```
POST /api/admin/init-vectors
```

#### Check Vector Database Status
```
GET /api/admin/vector-status
```

#### Add New Knowledge
```
POST /api/admin/add-knowledge
Content-Type: application/json

{
  "id": "new-knowledge-id",
  "type": "service",
  "title": "New Service Information",
  "content": "Detailed content...",
  "metadata": {
    "category": "services",
    "keywords": ["keyword1", "keyword2"],
    "priority": 3
  }
}
```

## 🎨 Embedding as a Widget

The chat interface can be embedded on external websites:

```html
<!-- Add to your website -->
<div id="pest-control-chat"></div>
<script src="https://your-worker-domain.workers.dev/chat.js"></script>
```

## 🐛 Common Issues & Solutions

### Vector Database Not Initialized
**Problem**: "Vector database not initialized" error
**Solution**: Run `initializeVectorDB()` in browser console or call `/api/admin/init-vectors`

### CORS Issues
**Problem**: Chat widget not working on external domains
**Solution**: CORS is pre-configured for `*`. Verify deployment includes CORS headers.

### Slow Responses
**Problem**: RAG queries taking too long
**Solution**: Reduce `topK` parameter in vector search or optimize knowledge base size

### Embedding Errors
**Problem**: Vector embedding generation fails
**Solution**: Check Cloudflare AI binding and ensure model `@cf/baai/bge-base-en-v1.5` is available

## 📈 Performance Optimization

1. **Knowledge Base**: Keep entries focused and well-structured
2. **Vector Search**: Tune similarity thresholds and result limits
3. **Caching**: Enable AI Gateway for response caching
4. **Chunking**: Optimize content chunking for better retrieval

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Update knowledge base or improve RAG functionality
4. Test with real pest control queries
5. Submit a pull request

## 📞 Lake Highlands Pest Control

- **Phone**: (972) 693-0926
- **Service Area**: Lake Highlands, Richardson, Dallas, Texas
- **Established**: 2016
- **Owners**: Vanston and Jiraporn Hamilton

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built on Cloudflare Workers AI platform
- Inspired by the need for better pest control customer service
- Knowledge base based on real Lake Highlands Pest Control services

---

**Note**: This is a demonstration project showing how to integrate RAG with Cloudflare Workers AI for domain-specific chatbots. Adapt the knowledge base and styling for your specific business needs.
