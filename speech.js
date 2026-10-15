(function () {
  const state = {
    bound: false,
    button: null,
    status: null,
    speaking: false
  };

  function updateButton() {
    const button = document.getElementById('ttsToggle');
    if (!button) return;
    state.button = button;
    button.classList.toggle('speaking', state.speaking);
    button.setAttribute('aria-pressed', String(state.speaking));
    button.setAttribute('title', state.speaking ? 'Stop reading aloud' : 'Read aloud');
    button.textContent = state.speaking ? '🔊 Stop' : '🔊 Read aloud';
  }

  function setStatus(message) {
    const status = document.getElementById('ttsStatus');
    if (!status) return;
    state.status = status;
    status.textContent = message || '';
  }

  function getReadText() {
    const app = document.getElementById('app');
    if (!app) return 'Smart Clinic Queue';

    const text = app.innerText
      .replace(/\s+/g, ' ')
      .trim();

    return text || 'Smart Clinic Queue';
  }

  function stopReading() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    state.speaking = false;
    updateButton();
    setStatus('');
  }

  function startReading() {
    if (!('speechSynthesis' in window)) {
      setStatus('Text-to-speech unavailable');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(getReadText());
    utterance.lang = document.documentElement.lang || navigator.language || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = function () {
      state.speaking = true;
      updateButton();
      setStatus('Reading aloud');
    };

    utterance.onend = function () {
      state.speaking = false;
      updateButton();
      setStatus('');
    };

    utterance.onerror = function () {
      state.speaking = false;
      updateButton();
      setStatus('Voice unavailable');
    };

    window.speechSynthesis.speak(utterance);
  }

  function toggleReading() {
    if (state.speaking) {
      stopReading();
      return;
    }

    startReading();
  }

  function setup() {
    if (state.bound) return;
    state.bound = true;

    document.addEventListener('click', function (event) {
      const button = event.target.closest('#ttsToggle');
      if (!button) return;
      toggleReading();
    });

    if (!('speechSynthesis' in window)) {
      const button = document.getElementById('ttsToggle');
      if (button) {
        button.disabled = true;
        button.title = 'Text-to-speech not supported';
        button.textContent = '🔊 Not supported';
      }
      return;
    }

    updateButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
