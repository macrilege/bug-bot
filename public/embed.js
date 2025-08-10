(function(){
  const BASE = 'https://lh-bugbot.vanston27.workers.dev';

  function loadCSS(href) {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      document.body.appendChild(s);
    });
  }

  function injectMarkup() {
    if (document.querySelector('.chat-widget')) return;
    const container = document.createElement('div');
    container.className = 'chat-widget';
    container.innerHTML = `
      <button id="chatToggle" class="chat-toggle">
        <i class="fas fa-comment-dots"></i>
      </button>
      <div id="chatWindow" class="chat-window">
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="chat-header-avatar">🐛</div>
            <div class="chat-header-info">
              <h3>Pest Control Assistant</h3>
              <p>Ask me about pest control!</p>
            </div>
          </div>
          <button id="chatClose" class="chat-close">×</button>
        </div>
        <div id="chatBody" class="chat-body">
          <div class="chat-message">
            <div class="chat-message-avatar">🤖</div>
            <div class="chat-message-content">
              Hi! I'm your pest control assistant. How can I help you today?
            </div>
          </div>
        </div>
        <div class="chat-quick-options">
          <button class="chat-quick-option" data-message="What pests do you treat?">What pests do you treat?</button>
          <button class="chat-quick-option" data-message="How much does pest control cost?">Pricing info</button>
          <button class="chat-quick-option" data-message="Is it safe for pets and kids?">Safe for pets/kids?</button>
          <button class="chat-quick-option priority" data-message="How often should I get treatments?">Treatment frequency</button>
        </div>
        <div class="chat-input-area">
          <form id="chatForm" class="chat-input-form">
            <input id="chatInput" type="text" class="chat-input" placeholder="Type your question..." autocomplete="off">
            <button type="submit" class="chat-send-btn"><i class="fas fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  async function init() {
    // Load CSS (FA optional)
    try { await loadCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'); } catch {}
    await loadCSS(BASE + '/chat-widget.css');

    // Inject markup
    injectMarkup();

    // Load behavior script last
    await loadScript(BASE + '/chat-widget-lhpest.js');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
