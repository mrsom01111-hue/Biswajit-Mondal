// Audio utilities for DTMF keypad sounds, ringtones, and speech synthesis

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// DTMF frequencies for standard dialpad keys
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

export function playDtmfTone(key: string, durationMs = 120) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = DTMF_FREQUENCIES[key];
    if (!freqs) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + durationMs / 1000);
    osc2.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
}

export function playRingSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Ignore audio error
  }
}

// Speak aloud using browser SpeechSynthesis with language detection (Hindi hi-IN / English / Bengali)
export function speakText(text: string, voicePitch = 1.0, voiceRate = 1.0, lang = 'hi-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voicePitch;
    utterance.rate = voiceRate;

    // Detect script
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasBengali = /[\u0980-\u09FF]/.test(text);

    let targetLang = lang;
    if (hasHindi) {
      targetLang = 'hi-IN';
    } else if (hasBengali) {
      targetLang = 'bn-IN';
    } else if (lang.startsWith('hi')) {
      targetLang = 'hi-IN';
    } else if (lang.startsWith('en')) {
      targetLang = lang;
    }

    utterance.lang = targetLang;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (targetLang.startsWith('hi')) {
        const hindiVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('hi') ||
            v.name.toLowerCase().includes('hindi') ||
            v.lang.toLowerCase().includes('hi-in')
        );
        if (hindiVoice) utterance.voice = hindiVoice;
      } else if (targetLang.startsWith('bn')) {
        const bengaliVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('bn') || v.name.toLowerCase().includes('bangla')
        );
        if (bengaliVoice) utterance.voice = bengaliVoice;
      } else {
        const englishVoice = voices.find(
          (v) =>
            v.lang.includes('en') &&
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('India'))
        );
        if (englishVoice) utterance.voice = englishVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis not permitted:', err);
  }
}

// Browser Web Speech Recognition Helper (supporting hi-IN, en-US, en-IN)
export function createSpeechRecognizer(
  lang = 'hi-IN',
  onResult: (text: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
) {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      onResult(speechToText);
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Recognition error');
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  } catch (e) {
    return null;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
