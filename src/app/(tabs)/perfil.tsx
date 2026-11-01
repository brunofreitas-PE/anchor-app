import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, T } from '@/components/ui';
import { Space } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { session } = useAuth();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <T variant="title">Perfil</T>
        <Card style={{ gap: 4 }}>
          <T variant="label" muted>
            CONTA
          </T>
          <T>{session?.user.email ?? '—'}</T>
        </Card>
        <Card style={{ gap: 4 }}>
          <T variant="label" muted>
            PLANO
          </T>
          <T>Gratuito</T>
          <T variant="caption" muted>
            O plano Premium chega numa próxima versão.
          </T>
        </Card>
        <View style={{ flex: 1 }} />
        <Button kind="outline" title="Sair da conta" onPress={() => supabase.auth.signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Space.lg, paddingTop: Space.xl, gap: Space.md },
});
