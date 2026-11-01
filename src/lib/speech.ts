// Carrega o reconhecimento de voz só se o módulo nativo existir.
// No Expo Go ele não existe: o app continua funcionando e a pessoa digita a frase.

import type * as SpeechModule from 'expo-speech-recognition';

let speech: typeof SpeechModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  speech = require('expo-speech-recognition') as typeof SpeechModule;
  // Força a checagem do módulo nativo agora, e não no meio da gravação.
  speech.ExpoSpeechRecognitionModule.isRecognitionAvailable();
} catch {
  speech = null;
}

export const Speech = speech?.ExpoSpeechRecognitionModule ?? null;

type EventName = keyof SpeechModule.ExpoSpeechRecognitionNativeEventMap;

/** Igual a useSpeechRecognitionEvent, mas não faz nada sem o módulo nativo. */
export const useSpeechEvent: typeof SpeechModule.useSpeechRecognitionEvent =
  speech?.useSpeechRecognitionEvent ??
  (<K extends EventName>(_event: K, _listener: (ev: SpeechModule.ExpoSpeechRecognitionNativeEventMap[K]) => void) => {});
