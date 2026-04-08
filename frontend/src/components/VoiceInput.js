import { isSpeechSupported, startVoiceInput, stopVoiceInput } from '../utils/voice.js';
import { t } from '../utils/i18n.js';

export function createVoiceButton(onText) {
  if (!isSpeechSupported()) {
    return '';
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-voice';
  button.textContent = t('voice_input');
  button.onclick = () => {
    button.textContent = '🎤 Listening...';
    button.disabled = true;
    
    const recognition = startVoiceInput(
      (text) => {
        onText(text);
        button.textContent = t('voice_input');
        button.disabled = false;
      },
      (error) => {
        console.error(error);
        button.textContent = t('voice_input');
        button.disabled = false;
      }
    );
    
    setTimeout(() => {
      if (recognition) stopVoiceInput(recognition);
    }, 10000);
  };
  
  return button;
}

export function injectVoiceInput(inputElement) {
  if (!inputElement || !isSpeechSupported()) return;
  
  const container = inputElement.parentElement;
  const voiceBtn = createVoiceButton((text) => {
    inputElement.value = text;
    inputElement.dispatchEvent(new Event('input'));
  });
  
  if (voiceBtn) {
    container.appendChild(voiceBtn);
  }
}
