# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## WebSocket temps reel

Le frontend ouvre une connexion WebSocket apres authentification avec `VITE_WS_URL`.
Par defaut, cette valeur est `ws://127.0.0.1:8000/ws/notifications/`. Le token JWT est
transmis dans le parametre `token` de l'URL, car le navigateur ne permet pas d'ajouter
un header HTTP personnalise pendant le handshake WebSocket.

Le backend peut envoyer une notification avec :

```json
{
  "type": "notification",
  "notification": {
    "id": 42,
    "type": "EVENEMENT",
    "category": "SCHOOL"
  }
}
```

Et un nouveau message avec :

```json
{
  "type": "message",
  "message": {
    "id": 43,
    "sender_id": 7,
    "destinataire_id": 12,
    "contenu": "Bonjour",
    "created_at": "2026-09-17T10:30:00Z"
  }
}
```

Les événements peuvent aussi utiliser `event` à la place de `type`, et `data` à la
place de `notification` ou `message`.
