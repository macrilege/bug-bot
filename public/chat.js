/**
 * BugBot Chat App Frontend - Lake Highlands Pest Control
 *
 * Handles the chat UI interactions and communication with the RAG-enhanced backend API.
 */

// DOM elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Chat state
let chatHistory = [
  {
    role: "assistant",
    content:
      "👋 Hello! I'm BugBot, your AI assistant for Lake Highlands Pest Control. I'm here to help with information about our pest control services, common pests in the Dallas/Richardson area, and guide you to the right solutions for your pest problems.\n\n🏆 How can I help you today? Ask me about our services, specific pest issues, or call (972) 693-0926 for immediate assistance!",
  },
];
let isProcessing = false;

// Auto-resize textarea as user types
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Send message on Enter (without Shift)
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Send button click handler
sendButton.addEventListener("click", sendMessage);

/**
 * Sends a message to the chat API and processes the response
 */
async function sendMessage() {
  const message = userInput.value.trim();

  // Don't send empty messages
  if (message === "" || isProcessing) return;

  // Disable input while processing
  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  // Add user message to chat
  addMessageToChat("user", message);

  // Clear input
  userInput.value = "";
  userInput.style.height = "auto";

  // Show typing indicator
  typingIndicator.classList.add("visible");

  // Add message to history
  chatHistory.push({ role: "user", content: message });

  try {
    // Create new assistant response element
    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";
    assistantMessageEl.innerHTML = "<p></p>";
    chatMessages.appendChild(assistantMessageEl);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send request to API with enhanced context
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory,
      }),
    });

    // Handle errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is streaming or JSON
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      // Handle JSON response (error case)
      const data = await response.json();
      throw new Error(data.error || "Unknown error occurred");
    }

    // Process streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk
      const chunk = decoder.decode(value, { stream: true });

      // Process SSE format - handle both newline and direct streaming
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.trim() === "") continue;
        
        try {
          // Try to parse as JSON first (SSE format)
          const jsonData = JSON.parse(line);
          if (jsonData.response) {
            responseText += jsonData.response;
            updateMessageContent(assistantMessageEl, responseText);
          }
        } catch (e) {
          // If not JSON, treat as direct streaming text
          if (line.trim()) {
            responseText += line;
            updateMessageContent(assistantMessageEl, responseText);
          }
        }
      }
    }

    // Add completed response to chat history
    if (responseText.trim()) {
      chatHistory.push({ role: "assistant", content: responseText });
    }

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = getErrorMessage(error);
    addMessageToChat("assistant", errorMessage);
  } finally {
    // Hide typing indicator
    typingIndicator.classList.remove("visible");

    // Re-enable input
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

/**
 * Helper function to add message to chat
 */
function addMessageToChat(role, content) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;
  
  // Format content with proper line breaks and emojis
  const formattedContent = formatMessageContent(content);
  messageEl.innerHTML = `<p>${formattedContent}</p>`;
  
  chatMessages.appendChild(messageEl);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Update message content while streaming
 */
function updateMessageContent(messageEl, content) {
  const formattedContent = formatMessageContent(content);
  messageEl.querySelector("p").innerHTML = formattedContent;
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Format message content for better display
 */
function formatMessageContent(content) {
  return content
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Highlight phone number
    .replace(/\(972\) 693-0926/g, '<strong style="color: #2d5016;">📞 (972) 693-0926</strong>')
    // Highlight important warnings
    .replace(/IMPORTANT:/g, '<strong style="color: #dc3545;">⚠️ IMPORTANT:</strong>')
    .replace(/WARNING:/g, '<strong style="color: #dc3545;">⚠️ WARNING:</strong>')
    .replace(/NOTE:/g, '<strong style="color: #856404;">📝 NOTE:</strong>');
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error) {
  if (error.message.includes("Failed to fetch") || error.message.includes("network")) {
    return "🔌 Sorry, there seems to be a connection issue. Please check your internet connection and try again. For immediate assistance, please call (972) 693-0926.";
  }
  
  if (error.message.includes("500") || error.message.includes("server")) {
    return "🛠️ Our AI system is temporarily experiencing issues. For immediate pest control assistance, please call Lake Highlands Pest Control at (972) 693-0926.";
  }
  
  return "😔 Sorry, there was an error processing your request. For immediate assistance with pest control services, please call (972) 693-0926.";
}

// Initialize admin functions for development
window.initializeVectorDB = async function() {
  try {
    const response = await fetch("/api/admin/init-vectors", {
      method: "POST"
    });
    const result = await response.json();
    console.log("Vector DB initialization result:", result);
    return result;
  } catch (error) {
    console.error("Error initializing vector DB:", error);
  }
};

window.checkVectorStatus = async function() {
  try {
    const response = await fetch("/api/admin/vector-status");
    const result = await response.json();
    console.log("Vector DB status:", result);
    return result;
  } catch (error) {
    console.error("Error checking vector status:", error);
  }
};

// Add quick question functionality to global scope
window.askQuestion = function(question) {
  const input = document.getElementById('user-input');
  input.value = question;
  sendMessage();
};

// Add some helpful console commands for development
console.log(`
🐛 BugBot Development Console Commands:
- initializeVectorDB() - Initialize the vector database
- checkVectorStatus() - Check vector database status
- askQuestion('your question') - Ask a question programmatically

📞 Lake Highlands Pest Control: (972) 693-0926
🌐 Service Area: Lake Highlands, Richardson, Dallas, Texas
`);

/**
 * Enhanced error handling for network issues
 */
window.addEventListener('online', function() {
  if (isProcessing) {
    // Retry last message if we were processing when connection was lost
    console.log("Connection restored, you may want to resend your last message.");
  }
});

window.addEventListener('offline', function() {
  if (isProcessing) {
    addMessageToChat("assistant", "🔌 It looks like you've lost internet connection. Please check your connection and try again. For immediate assistance, call (972) 693-0926.");
    
    // Reset processing state
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    typingIndicator.classList.remove("visible");
  }
});
