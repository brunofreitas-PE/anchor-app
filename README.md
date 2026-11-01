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

O reconhecimento de voz usa código nativo, então não roda no app Expo Go. Para testar no celular, gere uma versão de desenvolvimento:

```bash
npx eas-cli@latest build --profile development --platform android
```

## Banco de dados

Antes de usar o app, rode no SQL Editor do Supabase o arquivo `supabase/migrations/20261101000000_mvp_ajustes.sql`. Ele adiciona as colunas que o app usa e remove a política que deixava o usuário se dar Premium sozinho.

## Comandos úteis

```bash
npm run typecheck   # checagem de tipos
npx expo lint       # lint
```
