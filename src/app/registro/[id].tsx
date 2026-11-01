import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Field, T, usePalette } from '@/components/ui';
import { Font, Space } from '@/constants/theme';
import {
  deleteRegistration,
  getRegistration,
  markRetrieved,
  timeAgo,
  updateRegistration,
  type Registration,
} from '@/lib/registrations';

/** Detalhe de um objeto guardado: peguei de volta, editar ou apagar. */
export default function RegistrationScreen() {
  const c = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Registration | null>(null);
  const [object, setObject] = useState('');
  const [location, setLocation] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getRegistration(id)
      .then((r) => {
        setItem(r);
        setObject(r.object);
        setLocation(r.location);
      })
      .catch(() => {
        Alert.alert('Não encontrei esse registro.');
        router.back();
      });
  }, [id]);

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      router.back();
    } catch (e) {
      Alert.alert('Não deu certo', e instanceof Error ? e.message : 'Tente de novo.');
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Apagar este registro?', 'Não dá para desfazer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => act(() => deleteRegistration(id)) },
    ]);
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Button
          kind="ghost"
          title="Voltar"
          onPress={() => router.back()}
          icon={<Ionicons name="chevron-back" size={20} color={c.primary} />}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
        />

        {editing ? (
          <>
            <Field label="O quê" value={object} onChangeText={setObject} />
            <Field label="Onde" value={location} onChangeText={setLocation} />
            <Button
              title="Salvar alterações"
              loading={busy}
              onPress={() => act(() => updateRegistration(id, { object, location }))}
            />
            <Button kind="ghost" title="Cancelar" onPress={() => setEditing(false)} />
          </>
        ) : (
          <>
            <View style={[styles.answer, { backgroundColor: c.surface, borderColor: c.action }]}>
              <T muted style={{ fontSize: 14 }}>
                {item.object} está em
              </T>
              <T style={styles.location}>{item.location}</T>
              <T variant="caption" style={{ color: c.textMuted }}>
                Guardado {timeAgo(item.created_at)}
              </T>
            </View>
            <Button
              kind="primary"
              title="Peguei de volta"
              loading={busy}
              onPress={() => act(() => markRetrieved(id))}
            />
            <Button kind="outline" title="Editar" onPress={() => setEditing(true)} />
            <Button kind="ghost" title="Apagar" onPress={confirmDelete} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: Space.lg, gap: Space.md },
  answer: { borderRadius: 20, borderWidth: 2, padding: 20, gap: 4 },
  location: { fontSize: 26, lineHeight: 34, fontFamily: Font.bold },
});
