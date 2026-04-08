export function isSpeechSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startVoiceInput(onResult, onError) {
  if (!isSpeechSupported()) {
    onError('Voice input not supported');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError(`Voice error: ${event.error}`);
  };

  recognition.start();
  return recognition;
}

export function stopVoiceInput(recognition) {
  if (recognition) {
    recognition.stop();
  }
}
