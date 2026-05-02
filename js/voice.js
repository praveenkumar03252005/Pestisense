/* ════════════════════════════════════════
   voice.js
   Handles: Voice commands & multi-lingual speech.
   ════════════════════════════════════════ */

function initVoiceSupport() {
  const voiceBtn = document.getElementById('voice-btn');
  const voiceTarget = document.getElementById('voice-target');
  
  if(!voiceBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.style.display = 'none';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = currentLang === 'te' ? 'te-IN' : 'en-IN';
  recognition.interimResults = false;

  voiceBtn.onclick = () => {
    recognition.start();
    voiceTarget.textContent = T('voice-recording');
    voiceBtn.style.background = 'var(--red)';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('loc-input').value = transcript;
    voiceBtn.style.background = 'var(--soil)';
    voiceTarget.textContent = T('voice-done');
    setTimeout(() => voiceTarget.textContent = '', 2000);
  };

  recognition.onerror = () => {
    voiceBtn.style.background = 'var(--soil)';
    voiceTarget.textContent = 'Error — try again';
  };
}
