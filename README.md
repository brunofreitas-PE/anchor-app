# Anchor

App para pessoas com TDAH registrarem, por voz, onde guardaram as coisas, e encontrarem depois.

Feito com [Expo](https://expo.dev) (React Native, Android e iOS com o mesmo código) e [Supabase](https://supabase.com) (login, banco com RLS e a Edge Function `process-voice`, que separa objeto e local da frase).

## O que já funciona

- Login e cadastro por e-mail e senha
- Início com o botão de voz e os últimos 5 objetos guardados
- Gravar: reconhecimento de voz do próprio celular em português; dá para digitar se a voz falhar
- Confirmar: revisar e corrigir objeto e local antes de salvar
- Buscar por objeto ou local
- Detalhe do objeto: peguei de volta, editar, apagar
- Perfil com sair da conta

Ainda não: login com Google e Apple, plano Premium, checklist de saída.

## Rodar no seu computador

1. Instale o [Node.js](https://nodejs.org) (versão LTS).
2. Copie `.env.example` para `.env` e cole a chave **anon** do Supabase (Project Settings > API).
3. No terminal, dentro da pasta do projeto:

   ```bash
   npm install
   npx expo start
   ```

4. Instale o app **Expo Go** no celular e escaneie o QR code que aparece no terminal (celular e computador na mesma rede Wi-Fi).

No Expo Go o app funciona inteiro, mas a frase é digitada: o reconhecimento de voz usa código nativo, que o Expo Go não tem. Para testar a voz, gere uma versão de desenvolvimento:

```bash
npx eas-cli@latest build --profile development --platform android
```

## Supabase (do zero)

1. Crie um projeto em [supabase.com](https://supabase.com): região **South America (São Paulo)**, plano **Free**.
2. **Banco:** em SQL Editor > New query, cole todo o arquivo `supabase/migrations/20261101000000_schema_inicial.sql` e clique em Run. Ele cria as tabelas `registrations` e `subscriptions`, com RLS (cada pessoa só vê o que é seu) e plano gratuito automático para contas novas.
3. **Login por e-mail:** em Authentication > Sign In / Providers > Email, para testar mais rápido, desligue "Confirm email".
4. **Função de voz:** em Edge Functions > Deploy a new function > Via Editor, dê o nome `process-voice`, cole o conteúdo de `supabase/functions/process-voice/index.ts` e clique em Deploy.
5. **Opcional, IA melhor:** em Edge Functions > Secrets, crie `ANTHROPIC_API_KEY` com uma chave de [console.anthropic.com](https://console.anthropic.com). Sem ela, a função usa uma regra simples em português, que já entende frases como “guardei as chaves na gaveta da cozinha”.

## Comandos úteis

```bash
npm run typecheck   # checagem de tipos
npx expo lint       # lint
```
