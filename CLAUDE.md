# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apypos is a Monster Hunter Explore (MHXR) private server emulator (AGPL-3.0). MHXR was a mobile-exclusive Monster Hunter title (iOS/Android) shut down by Capcom. This server handles HTTP API routes with Blowfish-encrypted payloads, real-time multiplayer via Socket.IO, and serves game resource files (FPK archives).

## Commands

```bash
yarn install               # Install dependencies
yarn build                 # Clean + tsc (via tsconfig.build.json) → dist/
yarn start                 # Production: node dist/server.js
yarn run start:dev         # Dev mode: nodemon with ts-node (auto-reload on .ts changes)
yarn dev                   # Dev mode: tsx src/server.ts (no nodemon)
yarn lint                  # ESLint (strictTypeChecked) on src/
yarn format                # Prettier on src/**/*.ts
yarn test                  # Vitest (run once)
yarn test:watch            # Vitest (watch mode)
yarn test:coverage         # Vitest with v8 coverage
```

Run a single test file:
```bash
npx vitest run src/services/crypto/encryptionService.spec.ts
```

Utility scripts:
```bash
yarn generate-island       # Generate ocean/island data (tsx src/services/oceanService.ts)
yarn generate-questList    # Generate quest lists (tsx src/services/questList.ts)
yarn bf-dec                # Test Blowfish decryption (tsx src/bin/testDecryption.ts)
yarn proxy                 # MITM proxy CLI (see Proxy section below)
```

Docker (includes MongoDB + Mongo-Express UI on port 8083):
```bash
docker-compose up
```

## Architecture

```
Client (Android/iOS)
  ↕ Blowfish ECB encrypted HTTP (application/octet-stream)
  ↕ Socket.IO 4.x binary packets (multiplayer, allowEIO3 for client compat)
Express 5 Server
  ├─ Decrypt middleware (Blowfish ECB → JSON) — src/app.ts
  ├─ Input sanitization (strips MongoDB $ operators)
  ├─ 27 API route groups — src/routes/routes.ts
  ├─ Encrypt response (JSON → Blowfish ECB) — encryptAndSend()
  └─ Static file serving (/public for FPK game resources)
Mongoose 9 ODM
  ↕
MongoDB (apypos database)
```

### Module System

Native ES modules (`"type": "module"` in package.json). All local imports must use `.js` extensions (e.g., `import { foo } from './bar.js'`). JSON imports use `with { type: 'json' }`. TypeScript targets ES2022 with `nodenext` module resolution. Strict mode enabled with `noUncheckedIndexedAccess`.

### Request/Response Flow

All API requests arrive as `application/octet-stream` Blowfish-encrypted bodies. The middleware in `src/app.ts` decrypts them before routing. Responses are encrypted via `encryptAndSend()` from `src/services/crypto/encryptionHelpers.ts`, which wraps data in an envelope containing session info, version numbers (`res_ver: 282`, `banner_ver: 91`), error codes, and time fields.

### Session Management

Sessions are managed in-memory in `src/services/crypto/encryptionHelpers.ts` with MongoDB persistence (restored on startup). Key parameters: 24h timeout, 5-minute cleanup interval, max 1000 sessions before forced cleanup. Sessions are keyed by UUID tokens and track user ID, IP, and User-Agent.

### Multiplayer (Socket.IO)

`src/multiServer.ts` handles room-based multiplayer with a 16-byte binary packet header format (room ID, player ID, sequence, emit type, flags, length). Events: `entry`, `cancel`, `match`, `data`, `host_change_request`, `lock/unlock`, `kick`.

### MITM Proxy (`src/proxy/`)

Development proxy for recording, replaying, and modifying encrypted MHXR traffic. Three modes:

```bash
yarn proxy record [--upstream URL] [--port PORT] [--verbose]   # Record exchanges to JSON
yarn proxy replay <recording.json> [--port PORT] [--verbose]   # Replay from recording
yarn proxy live [--upstream URL] [--rules FILE] [--port PORT]  # Forward with rule modifications
```

Control endpoints on localhost: `GET /__proxy/status`, `POST /__proxy/mode/live`, `POST /__proxy/mode/replay`, `GET /__proxy/session`. Automatically rewrites dispatch config to route client traffic through the proxy.

## Code Patterns

### Route Structure

Each API group follows: `src/routes/api/[name]/[name].router.ts` (Express router) + `[name].controller.ts` (handler logic). Controllers extract session via `getUserFromSession()`, query Mongoose models, and return via `encryptAndSend()`. Some groups have sub-routes (e.g., `user/equipset/`, `user/model/`, `user/otomoteam/`).

### Zod Validation

Schemas use `.loose()` (passthrough) because the game client sends extra fields not in the schema. Validation middleware in `src/middleware/validation.ts` calls `encryptAndSend()` with `ERROR_CODE.INVALID_REQUEST` on failure. Pattern:

```typescript
// schema: z.object({ session_id: z.string(), ... }).loose()
// router: userRouter.post('/get', validate(SessionOnlySchema), controller.get)
// controller: const { field } = req.body as SchemaInput;
```

### Testing

Tests use Vitest with `mongodb-memory-server` for database tests and `supertest` for HTTP endpoint tests. Test files are co-located as `*.spec.ts` next to the code they test. Build (`tsconfig.build.json`) excludes spec files. Coverage excludes `src/proxy/`.

### Error Codes

Error codes in responses: `4004` and `2004` = not authenticated. Error envelope fields: `error_code`, `error_category`, `error_detail`. Constants defined in `src/constants/error.codes.ts`. Error categories: `NONE`, `AUTO_RETRY`, `ERROR_DIALOG`, `RETRY_PROMPT`.

### Data Sources

- **CSV files** (`src/csv/`): Quest master data, subtargets, blocks, fixed rewards, ocean definitions
- **JSON files** (`src/json/`): Quest DB (by type), event definitions, node configs
- Quest and event data are loaded into memory at server startup in `src/server.ts`, seeded into MongoDB if collections are empty

### User Model

`src/model/user.ts` is the largest schema — contains equipment, skills, items (8+ sub-schemas in `src/model/items/`), otomo companions (`src/model/sidekicks/`), ocean progression, guild affiliation, and session tokens.

## ESLint Configuration

Uses `strictTypeChecked` from typescript-eslint. The `no-unsafe-*` family of rules is disabled because Express `req.body` is typed as `any`. The `no-confusing-void-expression` rule is off to allow the `return encryptAndSend(...)` early-return pattern in controllers. Commits follow conventional commits (commitizen + cz-conventional-changelog configured).

## Environment

Copy `.env.example` to `.env`. Key variables: `IP`, `PORT`, `DB_*` (MongoDB connection), `RES_URL`, `WEB_URL`, `DEBUG` (logs full request/response bodies when true), `IS_MAINTENANCE`.

### Protocol Constants

Defined in `src/constants/protocol.ts`: `RES_VER: 282`, `BANNER_VER: 91`, `APP_VER: "09.03.06"`. These are included in every response envelope and must match the game client version.

## Key Notes

- Node.js >= 20 required. Blowfish ECB uses `egoroof-blowfish` (pure JS).
- Game resource FPK files must be manually placed in `src/public/res/download/`; only v0282 is supported.
- Socket.IO v4 with `allowEIO3: true` for backward compatibility with the original game client (Engine.IO v3).
- Blowfish encryption key is hardcoded in `src/services/crypto/encryptionService.ts`.
- `frida/` contains Frida scripts for runtime reverse engineering of the game client (not part of the server).
- `scripts/` contains offline data conversion tools (XFS binary templates, XML→JSON, FPK packing).
