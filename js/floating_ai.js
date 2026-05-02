/* ════════════════════════════════════════
   floating_ai.js
   Handles: AI Chat Interface.
   ════════════════════════════════════════ */

function initFloatingAI() {
  const btn = document.getElementById('floating-ai-btn');
  const chat = document.getElementById('ai-chat-ui');
  const close = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const send = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');

  if(!btn) return;

  btn.onclick = () => {
    chat.style.display = (chat.style.display === 'flex') ? 'none' : 'flex';
    if(chat.style.display === 'flex') {
       input.focus();
       if(messages.children.length === 0) {
         addChatMessage('bot', 'Namaste! I am your PestiSense AI. How can I help you with your tomato crop today?');
       }
    }
  };

  close.onclick = () => chat.style.display = 'none';

  send.onclick = handleChatSend;
  input.onkeypress = (e) => { if(e.key === 'Enter') handleChatSend(); };
}

async function handleChatSend() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if(!text) return;

  addChatMessage('user', text);
  input.value = '';

  // Fake typing
  const loadingId = 'loading-' + Date.now();
  addChatMessage('bot', '...', loadingId);

  try {
    // In a real app, this would hit /api/chat
    await new Promise(r => setTimeout(r, 1500));
    const botReply = "Based on local data, you should monitor for Early Blight this week. Don't forget to check your soil's nitrogen levels before the next spray!";
    
    document.getElementById(loadingId).remove();
    addChatMessage('bot', botReply);

  } catch (err) {
    document.getElementById(loadingId).innerHTML = "Sorry, my AI brain is resting. Try again?";
  }
}

function addChatMessage(role, text, id = null) {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  if(id) div.id = id;
  div.innerHTML = `<div class="msg-bubble">${text}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function askAIExplanation() {
  const panel = document.getElementById('ai-explanation-panel');
  const content = document.getElementById('ai-explanation-content');
  
  panel.style.display = 'block';
  content.innerHTML = '<div class="loader-ring"></div><p style="text-align:center">AI is analyzing the report details...</p>';

  try {
     // Hit real Gemini or GPT endpoint here
     await new Promise(r => setTimeout(r, 2000));
     content.innerHTML = `
        <div class="ai-exp-text">
          <p>Hello! I've looked at your <strong>${lastAnalysisData.diagnosis.disease.en}</strong> diagnosis. The <strong>${lastAnalysisData.recommendations[0].brand}</strong> is your top choice because it covers both preventive and curative needs.</p>
          <p>Your soil shows <strong>Low Phosphorus</strong>, which might be why the plant's immunity was slightly lower. In your next irrigation, consider adding some water-soluble P-rich fertilizer.</p>
          <p>Weather for tomorrow is <strong>${lastAnalysisData.weather.temp}°C</strong> with <strong>${lastAnalysisData.weather.rainChance}%</strong> rain chance. This is perfect for spraying as it won't wash away!</p>
        </div>
     `;
  } catch (err) {
    content.innerHTML = "Error loading AI explanation.";
  }
}
