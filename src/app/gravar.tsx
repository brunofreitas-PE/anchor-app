import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, T, usePalette } from '@/components/ui';
import { Font, Space } from '@/constants/theme';
import { extractFromText } from '@/lib/registrations';
import { Speech, useSpeechEvent } from '@/lib/speech';

type Phase = 'pedindo' | 'ouvindo' | 'pronto' | 'sem-voz';

/**
 * Captura a frase pelo reconhecimento de voz do próprio celular (rápido e sem
 * enviar áudio). Se a voz não estiver disponível, a pessoa pode digitar.
 */
export default function RecordScreen() {
  const c = usePalette();
  const [phase, setPhase] = useState<Phase>('pedindo');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSpeechEvent('start', () => setPhase('ouvindo'));
  useSpeechEvent('end', () => setPhase((p) => (p === 'ouvindo' ? 'pronto' : p)));
  useSpeechEvent('result', (e) => {
    const t = e.results[0]?.transcript;
    if (t) setText(t);
  });
  useSpeechEvent('error', (e) => {
    if (e.error === 'aborted') return;
    setError('Não consegui ouvir. Tente de novo ou digite.');
    setPhase('pronto');
  });

  async function start() {
    setError(null);
    try {
      if (!Speech || !Speech.isRecognitionAvailable()) {
        setPhase('sem-voz');
        return;
      }
      const perm = await Speech.requestPermissionsAsync();
      if (!perm.granted) {
        setPhase('sem-voz');
        setError('Sem permissão do microfone. Você pode digitar.');
        return;
      }
      setText('');
      Speech.start({ lang: 'pt-BR', interimResults: true });
    } catch {
      setPhase('sem-voz');
    }
  }

  useEffect(() => {
    start();
    return () => Speech?.abort();
  }, []);

  async function done() {
    if (phase === 'ouvindo') Speech?.stop();
    const phrase = text.trim();
    if (!phrase) {
      setError('Diga ou digite onde guardou, por exemplo: “chaves na gaveta da cozinha”.');
      return;
    }
    setBusy(true);
    try {
      const x = await extractFromText(phrase);
      router.replace({
        pathname: '/confirmar',
        params: {
          object: x.object,
          location: x.location,
          raw: phrase,
          confidence: x.confidence == null ? '' : String(x.confidence),
        },
      });
    } catch {
      // Se a IA falhar, a pessoa ainda pode preencher à mão na confirmação.
      router.replace({ pathname: '/confirmar', params: { object: '', location: '', raw: phrase } });
    } finally {
      setBusy(false);
    }
  }

  const listening = phase === 'ouvindo';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.primary }]}>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
          onPress={() => router.back()}
          style={styles.close}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.center}>
        <T style={styles.status}>
          {listening ? 'Estou ouvindo…' : phase === 'sem-voz' ? 'Digite onde guardou' : 'Pronto?'}
        </T>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Parar de ouvir' : 'Falar de novo'}
          onPress={listening ? () => Speech?.stop() : start}
          style={[styles.ring1, { opacity: listening ? 1 : 0.7 }]}>
          <View style={styles.ring2}>
            <View style={styles.core}>
              <Ionicons name={listening ? 'mic' : 'mic-outline'} size={56} color={c.primary} />
            </View>
          </View>
        </Pressable>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="“guardei as chaves na gaveta da cozinha”"
          placeholderTextColor="rgba(255,255,255,0.6)"
          multiline
          accessibilityLabel="Frase com o objeto e o local"
          style={styles.transcript}
        />
        {error ? <T style={styles.error}>{error}</T> : null}
      </View>

      <Button title="Pronto" onPress={done} loading={busy} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: Space.lg, paddingBottom: Space.lg },
  top: { alignItems: 'flex-end', paddingTop: Space.sm },
  close: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
  status: { color: '#FFFFFF', fontFamily: Font.medium, fontSize: 20 },
  ring1: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring2: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcript: {
    color: '#FFFFFF',
    fontFamily: Font.regular,
    fontSize: 22,
    lineHeight: 32,
    textAlign: 'center',
    width: '100%',
    minHeight: 64,
  },
  error: { color: '#FFE2B5', textAlign: 'center' },
});
