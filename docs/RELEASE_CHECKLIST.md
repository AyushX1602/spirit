# Release Checklist

Use this before pushing Spirit OS to Git.

## Required Local Checks

```powershell
cd server
npm test
```

```powershell
cd client
npm test
npm run build
```

## Runtime Smoke Test

1. Start server: `cd server; npm run dev`
2. Start client: `cd client; npm run dev`
3. Open `http://localhost:5173`.
4. Check `http://localhost:3001/api/health`.
5. Open File Explorer and read a text file.
6. Open Terminal and run `battery` or `show my ip address`.
7. Open Notes, write text, run Ask AI, then replace/copy the result.
8. Change language in Settings and try a localized voice command.
9. Toggle gesture/sign/eye settings only after granting camera permission.

## Git Hygiene

Do not commit:

- `server/.env`
- `client/.env*`
- SQLite database files such as `server/prisma/savitaos.db`
- `node_modules/`
- `client/dist/`
- logs or temporary scratch files

Keep:

- `package-lock.json` files for reproducible installs.
- Prisma migrations.
- `client/public/models` runtime ML models.
- MediaPipe public assets if deployment expects static assets without running postinstall.

## AI Provider Notes

The app works without cloud AI keys using the offline Spirit engine. Cloud providers add better natural language handling:

- Gemini: primary tool-calling engine.
- Sarvam: Indic language LLM and voice services.
- OpenRouter: fallback LLM engine.
- Spirit: deterministic offline fallback.

## Known Operational Notes

- Browser speech recognition support varies by language and browser.
- Gujarati and other Indic commands are normalized after browser STT returns text.
- Server comments and DB names may still use the legacy `savitaos` name; this is intentional until a dedicated migration is planned.

