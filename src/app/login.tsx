import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Field, T, usePalette } from '@/components/ui';
import { Font, Space } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const c = usePalette();
  const [mode, setMode] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Confira os dados', 'Informe um e-mail e uma senha com pelo menos 6 caracteres.');
      return;
    }
    setBusy(true);
    const creds = { email: email.trim(), password };
    const { error } =
      mode === 'entrar'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp(creds);
    setBusy(false);
    if (error) Alert.alert('Não deu certo', error.message);
    // Com sessão válida, o layout raiz troca para as abas sozinho.
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={[styles.logo, { backgroundColor: c.primary }]}>
              <MaterialCommunityIcons name="anchor" size={52} color={c.onPrimary} />
            </View>
            <T style={styles.brand}>Anchor</T>
            <T muted style={styles.tagline}>
              Fale onde guardou.{'\n'}Encontre quando precisar.
            </T>
          </View>

          <View style={{ gap: Space.md }}>
            <Field
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={{ fontSize: 17, fontFamily: Font.regular }}
            />
            <Field
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
              style={{ fontSize: 17, fontFamily: Font.regular }}
            />
            <Button
              title={mode === 'entrar' ? 'Entrar' : 'Criar conta'}
              onPress={submit}
              loading={busy}
            />
            <Button
              kind="ghost"
              title={mode === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho conta'}
              onPress={() => setMode(mode === 'entrar' ? 'criar' : 'entrar')}
            />
            {/* Google e Apple entram no próximo PR (precisam de configuração nativa). */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 28, justifyContent: 'space-between', gap: Space.xl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingTop: 40 },
  logo: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: Font.bold, fontSize: 40, lineHeight: 48 },
  tagline: { fontSize: 19, lineHeight: 28, textAlign: 'center' },
});
