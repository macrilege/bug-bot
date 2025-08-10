/**
 * Lake Highlands Pest Control Chat Widget - Embeddable Version
 * 
 * Cross-domain embeddable chat widget for pest control websites
 * Hosted at: https://lh-bugbot.YOUR_SUBDOMAIN.workers.dev/chat-widget-lhpest.js
 * 
 * Usage:
 * <script src="https://lh-bugbot.YOUR_SUBDOMAIN.workers.dev/chat-widget-lhpest.js"></script>
 * <script>PestControlChatWidget.init();</script>
 */

// Chat Bot Widget Functionality
// Support both DOMContentLoaded and late injection
(function initWhenReady() {
    const start = () => {
        
// Chat Bot Widget Functionality
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');
    const quickOptions = document.querySelectorAll('.chat-quick-option');
    
    let chatbotResponsesLoaded = false;
    let inputPaddingObserverInitialized = false;

    // iOS Keyboard Detection and Viewport Height Management
    function initMobileKeyboardSupport() {
        // Set CSS custom property for viewport height (iOS Safari fix)
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        // Initial viewport height setting
        setViewportHeight();

        // Update on resize and orientation change
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 100);
        });

        // Detect virtual keyboard on mobile devices
        let initialViewportHeight = window.innerHeight;
        let keyboardDetectionTimeout;

        function detectKeyboard() {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            // If height decreased by more than 150px, assume keyboard is open
            if (heightDifference > 150) {
                chatWindow.classList.add('keyboard-open', 'keyboard-visible');
                // Scroll to bottom when keyboard opens
                setTimeout(() => {
                    if (chatBody) {
                        chatBody.scrollTop = chatBody.scrollHeight;
                    }
                }, 100);
            } else {
                chatWindow.classList.remove('keyboard-open', 'keyboard-visible');
            }
        }

        // Listen for viewport changes (keyboard show/hide)
        window.addEventListener('resize', function() {
            clearTimeout(keyboardDetectionTimeout);
            keyboardDetectionTimeout = setTimeout(detectKeyboard, 100);
        });

        // Visual Viewport API support (newer browsers)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
                const heightDifference = window.innerHeight - window.visualViewport.height;
                if (heightDifference > 150) {
                    chatWindow.classList.add('keyboard-open', 'keyboard-visible');
                    // Adjust chat window height using visual viewport
                    if (window.innerWidth <= 480) {
                        chatWindow.style.height = `${window.visualViewport.height}px`;
                    }
                } else {
                    chatWindow.classList.remove('keyboard-open', 'keyboard-visible');
                    if (window.innerWidth <= 480) {
                        chatWindow.style.height = '100vh';
                    }
                }
            });
        }

        // Prevent body scroll when chat is open on mobile
        function preventBodyScroll(prevent) {
            if (window.innerWidth <= 480) {
                if (prevent) {
                    document.body.style.overflow = 'hidden';
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                } else {
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.width = '';
                }
            }
        }

        // Apply body scroll prevention when chat opens/closes
        const originalToggleClick = chatToggle?.addEventListener;
        if (chatToggle) {
            chatToggle.addEventListener('click', function() {
                setTimeout(() => {
                    preventBodyScroll(chatWindow.classList.contains('open'));
                }, 100);
            });
        }

        if (chatClose) {
            chatClose.addEventListener('click', function() {
                preventBodyScroll(false);
            });
        }
    }

    // Replace opener icon with chat bubble if not already
    if (chatToggle && !chatToggle.querySelector('svg') && !chatToggle.querySelector('i')) {
        // Try Font Awesome icon first
        chatToggle.innerHTML = '<i class="fas fa-comment-dots"></i>';
        // If FA isn't loaded, fallback to inline SVG
        setTimeout(() => {
            const hasFA = !!chatToggle.querySelector('i.fas');
            if (!hasFA) {
                chatToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zM6 9h12v2H6V9zm0-3h12v2H6V6zm0 6h8v2H6v-2z"/></svg>';
            }
        }, 0);
    }

    // Ensure send button shows paper-plane (with fallback)
    const sendBtn = document.querySelector('.chat-send-btn');
    if (sendBtn && !sendBtn.querySelector('svg') && !sendBtn.querySelector('i')) {
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        setTimeout(() => {
            const hasFA = !!sendBtn.querySelector('i.fas');
            if (!hasFA) {
                sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
            }
        }, 0);
    }

    // Initialize mobile keyboard support
    initMobileKeyboardSupport();

    // Dynamically sync chat-body bottom padding with input area's height
    function syncBodyPaddingWithInput() {
        const inputArea = document.querySelector('.chat-input-area');
        if (!chatBody || !inputArea) return;
        const inputHeight = inputArea.getBoundingClientRect().height;
        // Add some extra breathing room below messages
        const extra = 20;
        chatBody.style.paddingBottom = `${Math.ceil(inputHeight + extra)}px`;
    }

    function initInputPaddingObserver() {
        if (inputPaddingObserverInitialized) return;
        const inputArea = document.querySelector('.chat-input-area');
        if (!inputArea) return;
        inputPaddingObserverInitialized = true;

        // Observe size changes of input area (keyboard open/close, wrapping, etc.)
        const ro = new ResizeObserver(() => {
            syncBodyPaddingWithInput();
            // Keep latest message visible after resize
            scrollToBottom();
        });
        ro.observe(inputArea);

        // Also update on window resize and orientation changes
        window.addEventListener('resize', syncBodyPaddingWithInput);
        window.addEventListener('orientationchange', () => setTimeout(syncBodyPaddingWithInput, 100));

        // Initial sync
        syncBodyPaddingWithInput();
    }

    // Initialize padding observer early
    initInputPaddingObserver();

    // Load chatbot responses dynamically when chat is first opened
    function loadChatbotResponses() {
        if (!chatbotResponsesLoaded) {
            const script = document.createElement('script');
            script.src = 'chatbot-responses.js';
            script.onload = function() {
                chatbotResponsesLoaded = true;
            };
            document.head.appendChild(script);
        }
    }

    // Toggle chat window
    if (chatToggle) {
        chatToggle.addEventListener('click', function() {
            if (!chatWindow.classList.contains('open')) {
                // Opening chat
                loadChatbotResponses(); // Load responses when first opening
                chatWindow.classList.add('open');
                chatToggle.classList.add('active');
                
                // Hide the chat toggle icon when chat is open
                chatToggle.style.opacity = '0';
                chatToggle.style.visibility = 'hidden';
                chatToggle.style.transform = 'scale(0.8)';
                
                // Focus input when opening
                setTimeout(() => chatInput.focus(), 100);
            } else {
                // Closing chat
                chatWindow.classList.remove('open');
                chatToggle.classList.remove('active');
                
                // Show the chat toggle icon when chat is closed
                chatToggle.style.opacity = '1';
                chatToggle.style.visibility = 'visible';
                chatToggle.style.transform = 'scale(1)';
            }
        });
    }

    // Close chat window with close button
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            chatWindow.classList.remove('open');
            chatToggle.classList.remove('active');
            
            // Show the chat toggle icon when chat is closed
            chatToggle.style.opacity = '1';
            chatToggle.style.visibility = 'visible';
            chatToggle.style.transform = 'scale(1)';
        });
    }

    // Quick option clicks
    quickOptions.forEach(option => {
        option.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            sendUserMessage(message);
            handleBotResponse(message);
        });
    });

    // Chat form submission
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = chatInput.value.trim(); // Ensure trimming here too
            if (message) {
                sendUserMessage(message);
                handleBotResponse(message);
                chatInput.value = '';
                // Keep padding in sync after sending
                syncBodyPaddingWithInput();
                scrollToBottom();
            }
        });
    }

    // Smart auto-suggestions while typing
    if (chatInput) {
        // Visual input focus state for mobile CSS rules
        chatInput.addEventListener('focus', () => {
            chatWindow.classList.add('input-focused');
            syncBodyPaddingWithInput();
            scrollToBottom();
        });
        chatInput.addEventListener('blur', () => {
            chatWindow.classList.remove('input-focused');
            syncBodyPaddingWithInput();
        });
        let suggestionTimeout;
        chatInput.addEventListener('input', function(e) {
            clearTimeout(suggestionTimeout);
            const value = e.target.value.toLowerCase();
            
            suggestionTimeout = setTimeout(() => {
                showTypingSuggestions(value);
            }, 500);
        });

        // Enhanced focus handling for mobile keyboards
        chatInput.addEventListener('focus', function() {
            // Scroll chat body to bottom when input gains focus
            setTimeout(() => {
                if (chatBody) {
                    chatBody.scrollTop = chatBody.scrollHeight;
                }
                
                // Add keyboard-focused class for additional styling if needed
                chatWindow.classList.add('input-focused');
            }, 300); // Delay to allow keyboard animation
        });

        // Clear suggestions when input loses focus
        chatInput.addEventListener('blur', function() {
            setTimeout(() => {
                hideSuggestions();
                chatWindow.classList.remove('input-focused');
            }, 200);
        });

        // Prevent zoom on double-tap for iOS
        chatInput.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        // Handle Enter key for better mobile experience
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = e.target.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    // Show smart typing suggestions
    function showTypingSuggestions(input) {
        if (input.length < 3) {
            hideSuggestions();
            return;
        }

        const suggestions = [];
        const commonQuestions = [
            { trigger: ['ant', 'ants'], suggestion: 'I have ants in my kitchen' },
            { trigger: ['roach', 'cockroach'], suggestion: 'How do you treat cockroaches?' },
            { trigger: ['spider', 'spiders'], suggestion: 'I found spiders in my house' },
            { trigger: ['mouse', 'mice', 'rat'], suggestion: 'I hear mice in my walls' },
            { trigger: ['safe', 'pet'], suggestion: 'Is your treatment safe for pets?' },
            { trigger: ['price', 'cost'], suggestion: 'How much does pest control cost?' },
            { trigger: ['urgent', 'emergency', 'emergeny', 'emergancy'], suggestion: 'I need emergency pest control' },
            { trigger: ['quote', 'estimate'], suggestion: 'Can I get a free quote?' },
            { trigger: ['when', 'schedule'], suggestion: 'When can you come out?' },
            { trigger: ['experience', 'licensed'], suggestion: 'Are you licensed and insured?' }
        ];

        commonQuestions.forEach(item => {
            if (item.trigger.some(trigger => input.includes(trigger))) {
                suggestions.push(item.suggestion);
            }
        });

        if (suggestions.length > 0) {
            displaySuggestions(suggestions.slice(0, 3)); // Show max 3 suggestions
        } else {
            hideSuggestions();
        }
    }

    // Display typing suggestions
    function displaySuggestions(suggestions) {
        hideSuggestions(); // Remove existing

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'chat-suggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 10px 10px 0 0;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
            max-height: 120px;
            overflow-y: auto;
            z-index: 1000;
        `;

        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'chat-suggestion-item';
            suggestionItem.style.cssText = `
                padding: 10px 15px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                transition: background 0.2s ease;
                font-size: 0.9rem;
                color: #374151;
            `;
            suggestionItem.textContent = suggestion;

            suggestionItem.addEventListener('mouseenter', function() {
                this.style.background = '#f9fafb';
            });

            suggestionItem.addEventListener('mouseleave', function() {
                this.style.background = 'white';
            });

            suggestionItem.addEventListener('click', function() {
                const cleanSuggestion = suggestion.trim();
                chatInput.value = cleanSuggestion;
                chatInput.focus();
                hideSuggestions();
                // Auto-submit the suggestion
                setTimeout(() => {
                    sendUserMessage(cleanSuggestion);
                    handleBotResponse(cleanSuggestion);
                    chatInput.value = '';
                }, 100);
            });

            suggestionsContainer.appendChild(suggestionItem);
        });

        // Position relative to input area
        const inputArea = document.querySelector('.chat-input-area');
        inputArea.style.position = 'relative';
        inputArea.appendChild(suggestionsContainer);
    }

    // Hide suggestions
    function hideSuggestions() {
        const existing = document.querySelector('.chat-suggestions');
        if (existing) {
            existing.remove();
        }
    }

    // Function to add user message
    function sendUserMessage(message) {
        // Clean up the message to remove extra whitespace and line breaks
        const cleanMessage = message.trim().replace(/^\n+|\n+$/g, '');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user';
        
        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        avatar.innerHTML = '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'chat-message-content';
        content.textContent = cleanMessage; // Use textContent to avoid HTML parsing issues
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
        chatBody.appendChild(messageElement);
        scrollToBottom();
    }

    // Function to add bot response with typing animation
    function addBotMessage(message) {
        // Clean up the message more aggressively
        const cleanMessage = message
            .trim() // Remove leading/trailing whitespace
            .replace(/^\n+/, '') // Remove any leading newlines
            .replace(/\n+$/, '') // Remove any trailing newlines
            .replace(/^\s+/, ''); // Remove any leading spaces
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        avatar.innerHTML = '<i class="fas fa-bug"></i>';
        
        const content = document.createElement('div');
        content.className = 'chat-message-content';
        content.innerHTML = '<span class="typing-indicator">AI is typing...</span>';
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
        chatBody.appendChild(messageElement);
        scrollToBottom();

        // Simulate typing animation
        setTimeout(() => {
            const contentElement = messageElement.querySelector('.chat-message-content');
            contentElement.innerHTML = '';
            typeMessage(contentElement, cleanMessage);
        }, 800);
    }

    // Typing animation function
    function typeMessage(element, message) {
        // Simple approach: convert \n\n to paragraph spacing and \n to line breaks
        const htmlMessage = message
            .replace(/\n\n/g, '<br><br>') // Double newlines to double breaks for paragraph spacing
            .replace(/\n/g, '<br>'); // Single newlines to line breaks
        
        let index = 0;
        const typingSpeed = 15; // milliseconds per character (faster)
        
        function typeNextCharacter() {
            if (index < htmlMessage.length) {
                // Handle <br> tags as single units
                if (htmlMessage.substr(index, 4) === '<br>') {
                    element.innerHTML += '<br>';
                    index += 4;
                } else {
                    element.innerHTML += htmlMessage.charAt(index);
                    index++;
                }
                
                // Scroll more frequently during typing to keep up with long messages
                if (index % 10 === 0) scrollToBottom();
                setTimeout(typeNextCharacter, typingSpeed);
            } else {
                // Final scroll after message is complete with extra delay
                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            }
        }
        
        typeNextCharacter();
    }

    // Smart action handlers for clever chatbot interactions
    function performSmartActions(userMessage, response) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Auto-scroll to contact form when suggesting contact
        if (response.includes('contact form') || response.includes('call (972)') || 
            response.includes('schedule') || response.includes('appointment') || 
            response.includes('consultation') || response.includes('quote')) {
            setTimeout(() => {
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Briefly highlight the contact form
                    const contactForm = document.querySelector('.contact-form');
                    if (contactForm) {
                        contactForm.style.border = '2px solid #dc2626';
                        contactForm.style.transition = 'border 0.5s ease';
                        setTimeout(() => {
                            contactForm.style.border = 'none';
                        }, 3000);
                    }
                }
            }, 2000);
        }
        
        // Auto-scroll to services when discussing specific pests
        if (lowerMessage.includes('ant') || lowerMessage.includes('roach') || 
            lowerMessage.includes('spider') || lowerMessage.includes('rodent') || 
            lowerMessage.includes('mosquito') || lowerMessage.includes('wasp') ||
            lowerMessage.includes('pest') || lowerMessage.includes('what do you treat')) {
            setTimeout(() => {
                const servicesSection = document.querySelector('#services');
                if (servicesSection) {
                    servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Animate service cards
                    const serviceCards = document.querySelectorAll('.service-card');
                    serviceCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.transform = 'scale(1.05)';
                            card.style.transition = 'transform 0.3s ease';
                            setTimeout(() => {
                                card.style.transform = 'scale(1)';
                            }, 500);
                        }, index * 200);
                    });
                }
            }, 1500);
        }
        
        // Auto-scroll to about section when discussing credentials, experience, or company info
        if (lowerMessage.includes('licensed') || lowerMessage.includes('experience') || 
            lowerMessage.includes('years') || lowerMessage.includes('how long') || 
            lowerMessage.includes('credentials') || lowerMessage.includes('about') ||
            lowerMessage.includes('lake highlands') || lowerMessage.includes('local')) {
            setTimeout(() => {
                const aboutSection = document.querySelector('#about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 1800);
        }
        
        // Show phone number prominently for urgent requests
        if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || 
            lowerMessage.includes('emergeny') || lowerMessage.includes('emergancy') || // common misspellings
            lowerMessage.includes('now') || lowerMessage.includes('today') || 
            lowerMessage.includes('asap')) {
            setTimeout(() => {
                showPhonePopup();
            }, 2500);
        }
        
        // Auto-copy phone number when specifically asking for it
        if (lowerMessage.includes('phone number') || lowerMessage.includes('call you') || 
            lowerMessage.includes('number') || lowerMessage.includes('phone')) {
            setTimeout(() => {
                copyPhoneNumber();
            }, 2000);
        }
    }

    // Show prominent phone number popup for urgent requests
    function showPhonePopup() {
        // Remove existing popup if any
        const existingPopup = document.querySelector('.emergency-popup-container');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'emergency-popup-container';
        backdrop.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.3);
            z-index: 99998 !important;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const popup = document.createElement('div');
        popup.className = 'emergency-popup';
        popup.style.cssText = `
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(220, 38, 38, 0.5);
            z-index: 99999 !important;
            text-align: center;
            font-size: 1.2rem;
            font-weight: 600;
            animation: popupPulse 0.5s ease-out;
            min-width: 300px;
            max-width: 90vw;
            position: relative;
        `;
        
        popup.innerHTML = `
            <button style="
                position: absolute;
                top: 8px;
                right: 12px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            " class="emergency-close"
            onmouseover="this.style.background='rgba(255,255,255,0.3)'"
            onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
            <div style="margin-top: 5px;">
                🚨 URGENT PEST CONTROL<br>
                <span style="font-size: 1.5rem; margin: 10px 0; display: block; cursor: pointer;" class="phone-number">(972) 693-0926</span>
                <span style="font-size: 0.9rem; opacity: 0.9;">Tap phone to call • Available now</span>
            </div>
        `;
        
        // Add animations for popup and backdrop
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popupPulse {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes popupPulseOut {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.8); opacity: 0; }
            }
            @keyframes backdropFadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes backdropFadeOut {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Add backdrop fade-in animation
        backdrop.style.animation = 'backdropFadeIn 0.3s ease-out';
        
        // Phone number click handler
        const phoneNumber = popup.querySelector('.phone-number');
        phoneNumber.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = 'tel:9726930926';
        });
        
        // Close button handler
        const closeButton = popup.querySelector('.emergency-close');
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.style.animation = 'popupPulseOut 0.3s ease-out';
            backdrop.style.animation = 'backdropFadeOut 0.3s ease-out';
            setTimeout(() => {
                if (backdrop.parentNode) backdrop.remove();
                if (style.parentNode) style.remove();
            }, 300);
        });

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                popup.style.animation = 'popupPulseOut 0.3s ease-out';
                backdrop.style.animation = 'backdropFadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (backdrop.parentNode) backdrop.remove();
                    if (style.parentNode) style.remove();
                }, 300);
            }
        });
        
        backdrop.appendChild(popup);
        document.body.appendChild(backdrop);
        
        // No auto-removal - stays until manually closed
    }

    // Copy phone number to clipboard with notification
    function copyPhoneNumber() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText('(972) 693-0926').then(() => {
                showNotification('📞 Phone number copied! (972) 693-0926', 'success');
            });
        } else {
            // Fallback for older browsers
            showNotification('📞 Our phone number: (972) 693-0926', 'info');
        }
    }

    // Show notification messages
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'info' ? '#3b82f6' : '#dc2626';
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Slide out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) notification.remove();
            }, 300);
        }, 3000);
    }

    // Add smart suggestion buttons based on context
    function addSmartSuggestions(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const suggestionsContainer = document.querySelector('.chat-quick-options');
        
        if (!suggestionsContainer) return;
        
        // Clear existing suggestions
        suggestionsContainer.innerHTML = '';
        
        let suggestions = [];
        
        if (lowerMessage.includes('ant') || lowerMessage.includes('roach') || lowerMessage.includes('spider')) {
            suggestions = ['Schedule inspection', 'Get free quote', 'Learn about treatment'];
        } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
            suggestions = ['Schedule free assessment', 'Call now', 'View our services'];
        } else if (lowerMessage.includes('safe') || lowerMessage.includes('pet') || lowerMessage.includes('family')) {
            suggestions = ['Organic options', 'Safety protocols', 'Schedule consultation'];
        } else if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || 
                   lowerMessage.includes('emergeny') || lowerMessage.includes('emergancy')) {
            suggestions = ['Call emergency line', 'Same-day service', 'Get immediate help'];
        } else {
            suggestions = ['Get free quote', 'Schedule service', 'Call us now'];
        }
        
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'chat-quick-option';
            button.textContent = suggestion;
            button.addEventListener('click', () => {
                if (suggestion.includes('Call') || suggestion.includes('emergency')) {
                    window.location.href = 'tel:9726930926';
                } else if (suggestion.includes('quote') || suggestion.includes('assessment') || suggestion.includes('consultation')) {
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                        chatWindow.classList.remove('open');
                        chatToggle.classList.remove('active');
                        
                        // Show the chat toggle icon when closing chat
                        chatToggle.style.opacity = '1';
                        chatToggle.style.visibility = 'visible';
                        chatToggle.style.transform = 'scale(1)';
                        
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else if (suggestion.includes('services')) {
                    const servicesSection = document.querySelector('#services');
                    if (servicesSection) {
                        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
            suggestionsContainer.appendChild(button);
        });
    }

    // AI API Integration for pest control responses (Performance Optimized)
    async function handleBotResponse(userMessage) {
        // API base URL - Update this to your new worker URL after deployment
        const apiUrl = 'https://lh-bugbot.vanston27.workers.dev';
        const timeout = 15000;
        
        try {
            // Show typing indicator immediately
            addTypingIndicator();
            
            // Try AI API with timeout and performance monitoring
            const startTime = Date.now();
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    messages: [
                        { role: 'user', content: userMessage }
                    ]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;

            if (response.ok) {
                const data = await response.json();
                const aiResponse = data.response;
                
                // Remove typing indicator
                removeTypingIndicator();
                
                // Add response time indicator for slow responses
                const perfIndicator = responseTime > 5000 ? '⚡' : responseTime > 10000 ? '🌩' : '🤖';
                addBotMessage(`${perfIndicator} ${aiResponse}`);
                
                // Log performance
                console.log(`AI Response time: ${responseTime}ms`);
                
                // Perform smart actions after message is displayed
                performSmartActions(userMessage, aiResponse);
                // Add contextual suggestions
                setTimeout(() => {
                    addSmartSuggestions(userMessage);
                }, 1000);
                return;
            }
        } catch (error) {
            console.log(`AI API error (${error.message}), using static responses`);
            removeTypingIndicator();
        }

        // Fallback to static responses if API is unavailable
        if (typeof getChatbotResponse === 'function') {
            const response = getChatbotResponse(userMessage);
            setTimeout(() => {
                addBotMessage(`📋 ${response}`);
                performSmartActions(userMessage, response);
                setTimeout(() => {
                    addSmartSuggestions(userMessage);
                }, 1000);
            }, 800); // Faster fallback
        } else {
            // Ultimate fallback if nothing is loaded
            const fallbackResponse = "🔧 I'm currently connecting to my knowledge base. For immediate assistance, please call Lake Highlands Pest Control at (972) 693-0926!";
            setTimeout(() => {
                addBotMessage(fallbackResponse);
                performSmartActions(userMessage, fallbackResponse);
            }, 400);
        }
    }
    
    // Helper function to add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="chat-message-avatar">🤖</div>
            <div class="chat-message-content typing-indicator">
                AI is thinking<span class="dots">...</span>
            </div>
        `;

        chatBody.appendChild(typingDiv);
        scrollToBottom();
    }
    
    // Helper function to remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Scroll to bottom of chat with extra space for suggested questions
    function scrollToBottom() {
        if (!chatBody) return;
        
        // Enhanced scrolling for mobile keyboard compatibility
        const isMobile = window.innerWidth <= 480;
        const isKeyboardOpen = chatWindow.classList.contains('keyboard-open');
        
        if (isMobile && isKeyboardOpen) {
            // Use requestAnimationFrame for smooth scrolling on mobile
            requestAnimationFrame(() => {
                // Account for dynamic bottom padding
                const paddingBottom = parseInt(window.getComputedStyle(chatBody).paddingBottom || '0', 10);
                chatBody.scrollTop = chatBody.scrollHeight + paddingBottom;
                
                // Ensure input area is visible
                const inputArea = document.querySelector('.chat-input-area');
                if (inputArea) {
                    inputArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            });
        } else {
            const paddingBottom = parseInt(window.getComputedStyle(chatBody).paddingBottom || '0', 10);
            chatBody.scrollTop = chatBody.scrollHeight + paddingBottom;
        }
    }

    // Close chat when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.chat-widget') && chatWindow.classList.contains('open')) {
            // Don't auto-close for now - user can manually close
        }
    });
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
