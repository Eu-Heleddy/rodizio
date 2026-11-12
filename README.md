# 🍕 Rodízio — contador de fatias

App Android (Capacitor + Firebase). Salas em tempo real, avatar, ranking e imagens pra Story.

## Passo 1 — Firebase (5 min, grátis)
1. Acesse https://console.firebase.google.com → **Adicionar projeto** (pode desativar o Analytics).
2. No projeto: **Criação → Realtime Database → Criar banco de dados** → modo de teste.
3. Aba **Regras** → cole e publique:
```json
{ "rules": { "rooms": { "$room": { ".read": true, ".write": true } } } }
```
4. **Configurações do projeto (⚙️) → Seus apps → Web (</>)** → registre o app e copie o `firebaseConfig`.
   Confira que existe o campo `databaseURL` (aparece em Realtime Database → Dados).
5. Cole os valores em `src/firebase-config.js`.

## Passo 2 — GitHub
1. Crie um repositório e suba **todos os arquivos desta pasta** (inclusive a pasta `.github`).
2. Aba **Actions** → "Gerar APK" roda sozinho (ou **Run workflow**). Leva ~5–8 min.
3. Baixe o APK em **Releases** (direto pelo celular) ou em Actions → Artifacts → `Rodizio-APK`.
4. Instale (permita "fontes desconhecidas").

## Testar no PC (opcional)
`npm install && npm run dev`
