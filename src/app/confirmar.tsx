import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Field, T, usePalette } from '@/components/ui';
import { Space } from '@/constants/theme';
import { createRegistration } from '@/lib/registrations';

export default function ConfirmScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{
    object?: string;
    location?: string;
    raw?: string;
    confidence?: string;
  }>();
  const [object, setObject] = useState(params.object ?? '');
  const [location, setLocation] = useState(params.location ?? '');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!object.trim() || !location.trim()) {
      Alert.alert('Falta pouco', 'Preencha o que você guardou e onde.');
      return;
    }
    setBusy(true);
    try {
      await createRegistration({
        object,
        location,
        raw_text: params.raw,
        confidence: params.confidence ? Number(params.confidence) : null,
      });
      router.dismissTo('/');
    } catch (e) {
      Alert.alert('Não salvou', e instanceof Error ? e.message : 'Tente de novo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Button
            kind="ghost"
            title="Falar de novo"
            onPress={() => router.replace('/gravar')}
            icon={<Ionicons name="chevron-back" size={20} color={c.primary} />}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          />
          <View style={{ gap: 6 }}>
            <T variant="title">
              {params.object ? 'Entendi assim' : 'Me conta o que e onde'}
            </T>
            <T muted>Toque para corrigir, se precisar.</T>
          </View>

          <Field label="O quê" value={object} onChangeText={setObject} />
          <Field label="Onde" value={location} onChangeText={setLocation} />

          {params.raw ? (
            <View style={[styles.said, { backgroundColor: c.primarySoft }]}>
              <Ionicons name="checkmark" size={20} color={c.primary} />
              <T style={{ flex: 1, fontSize: 14, lineHeight: 20, color: c.primary }}>
                Você disse: “{params.raw}”
              </T>
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button title="Salvar" onPress={save} loading={busy} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Space.lg, gap: 18 },
  said: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14, alignItems: 'flex-start' },
  footer: { padding: Space.lg },
});
