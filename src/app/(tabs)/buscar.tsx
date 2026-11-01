import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegistrationRow } from '@/components/registration-row';
import { T, usePalette } from '@/components/ui';
import { Font, Space, TouchHeight } from '@/constants/theme';
import { search, type Registration } from '@/lib/registrations';

export default function SearchScreen() {
  const c = usePalette();
  const [term, setTerm] = useState('');
  const [items, setItems] = useState<Registration[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (t: string) => {
    try {
      setItems(await search(t));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro na busca.');
    }
  }, []);

  // Busca enquanto digita, com uma pequena pausa.
  useEffect(() => {
    const id = setTimeout(() => run(term), 250);
    return () => clearTimeout(id);
  }, [term, run]);

  useFocusEffect(
    useCallback(() => {
      run(term);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [run]),
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <T variant="title">Cadê meu…?</T>
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder="chaves, carregador, gaveta…"
          placeholderTextColor={c.textMuted}
          accessibilityLabel="Buscar objeto ou lugar"
          autoCorrect={false}
          returnKeyType="search"
          style={[
            styles.input,
            { borderColor: c.primary, backgroundColor: c.surface, color: c.text },
          ]}
        />
        <T variant="caption" style={{ color: c.textMuted }}>
          {items.length === 1 ? '1 resultado' : `${items.length} resultados`}
        </T>
      </View>
      {error ? <T style={{ color: c.danger, paddingHorizontal: Space.lg }}>{error}</T> : null}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => <RegistrationRow item={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          term ? <T muted>Nada com “{term}”. Tente outra palavra.</T> : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: Space.lg, paddingTop: Space.xl, gap: Space.md },
  input: {
    minHeight: TouchHeight,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 18,
    fontFamily: Font.regular,
    fontSize: 18,
  },
  list: { paddingHorizontal: Space.lg, paddingBottom: Space.xl, gap: 10 },
});
