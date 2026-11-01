import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegistrationRow } from '@/components/registration-row';
import { T, usePalette } from '@/components/ui';
import { Font, Space } from '@/constants/theme';
import { listActive, type Registration } from '@/lib/registrations';

export default function HomeScreen() {
  const c = usePalette();
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listActive(5));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <T variant="title">O que você guardou?</T>

        <View style={styles.micArea}>
          <Link href="/gravar" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Falar onde guardei"
              style={({ pressed }) => [
                styles.mic,
                {
                  backgroundColor: c.primary,
                  borderColor: c.primarySoft,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}>
              <Ionicons name="mic" size={64} color={c.onPrimary} />
            </Pressable>
          </Link>
          <T style={{ fontFamily: Font.medium, fontSize: 17 }}>Toque e fale</T>
          <T variant="caption" style={{ color: c.textMuted, fontSize: 14 }}>
            Ex.: “guardei o passaporte na mala azul”
          </T>
        </View>

        <View style={styles.listHeader}>
          <T variant="subtitle">Guardados recentes</T>
          <Link href="/buscar">
            <T style={{ color: c.primary, fontFamily: Font.medium, fontSize: 15 }}>Ver todos</T>
          </Link>
        </View>

        {error ? <T style={{ color: c.danger }}>{error}</T> : null}
        {!error && items.length === 0 && !loading ? (
          <T muted>Nada guardado ainda. Toque no microfone e diga onde deixou algo.</T>
        ) : null}
        <View style={{ gap: 10 }}>
          {items.map((it) => (
            <RegistrationRow key={it.id} item={it} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Space.lg, paddingTop: Space.xl, gap: Space.md },
  micArea: { alignItems: 'center', gap: 10, paddingVertical: Space.lg },
  mic: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sm,
  },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
