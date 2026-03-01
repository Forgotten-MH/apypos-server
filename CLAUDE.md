# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apypos is a Monster Hunter Explore (MHXR) private server emulator (AGPL-3.0). MHXR was a mobile-exclusive Monster Hunter title (iOS/Android) shut down by Capcom. This server handles HTTP API routes with Blowfish-encrypted payloads, real-time multiplayer via Socket.IO 2.3, and serves game resource files (FPK archives).

## Commands

```bash
yarn install               # Install dependencies
yarn build                 # Clean + tsc → dist/
yarn start                 # Production: node dist/server.js
yarn run start:dev         # Dev mode: nodemon with ts-node (auto-reload on .ts changes)
yarn lint                  # ESLint on src/**/*.ts
yarn format                # Prettier on src/**/*.ts
yarn generate-island       # Generate ocean/island data
yarn generate-questList    # Generate quest list
```

Docker (includes MongoDB + Mongo-Express UI on port 8083):
```bash
docker-compose up          # Start all services
```

## Architecture

```
Client (Android/iOS)
  ↕ Blowfish ECB encrypted HTTP (application/octet-stream)
  ↕ Socket.IO 4.x binary packets (multiplayer, allowEIO3 for client compat)
Express Server
  ├─ Decrypt middleware (Blowfish ECB → JSON)
  ├─ Input sanitization (strips MongoDB $ operators)
  ├─ 25 API route groups (/api/account, /api/quest, /api/guild, etc.)
  ├─ Encrypt response (JSON → Blowfish ECB)
  └─ Static file serving (/public for FPK game resources)
Mongoose ODM
  ↕
MongoDB (apypos database)
```

### Request/Response Flow

All API requests arrive as `application/octet-stream` Blowfish-encrypted bodies. The middleware in `src/app.ts` decrypts them before routing. Responses are encrypted via `encryptAndSend()` from `src/services/encryptionHelpers.ts`, which wraps data in an envelope containing session info, version numbers (`res_ver: 282`, `banner_ver: 91`), error codes, and time fields.

### Session Management

Sessions are managed in-memory in `encryptionHelpers.ts` with MongoDB persistence (restored on startup). Key parameters: 24h timeout, 5-minute cleanup interval, max 1000 sessions before forced cleanup. Sessions are keyed by UUID tokens and track user ID, IP, and User-Agent.

### Multiplayer (Socket.IO)

`src/multiServer.ts` handles room-based multiplayer with a 16-byte binary packet header format (room ID, player ID, sequence, emit type, flags, length). Events: `entry`, `cancel`, `match`, `data`, `host_change_request`, `lock/unlock`, `kick`.

## Code Patterns

### Route Structure

Each API group follows: `src/routes/api/[name]/[name].router.ts` (Express router) + `[name].controller.ts` (handler logic). Controllers extract session via `getUserFromSession()`, query Mongoose models, and return via `encryptAndSend()`.

### Error Codes

Error codes in responses: `4004` and `2004` = not authenticated. Error envelope fields: `error_code`, `error_category`, `error_detail`.

### Data Sources

- **CSV files** (`src/csv/`): Quest master data, subtargets, blocks, fixed rewards, ocean definitions
- **JSON files** (`src/json/`): Quest DB (by type), event definitions, node configs
- Quest and event data are loaded into memory at server startup in `src/server.ts`

### User Model

`src/model/user.ts` is the largest schema — contains equipment, skills, items (8+ sub-schemas in `src/model/items/`), otomo companions (`src/model/sidekicks/`), ocean progression, guild affiliation, and session tokens.

## Environment

Copy `.env.example` to `.env`. Key variables: `IP`, `PORT`, `DB_*` (MongoDB connection), `RES_URL`, `WEB_URL`, `DEBUG` (logs full request/response bodies when true), `IS_MAINTENANCE`.

## Key Notes

- Node.js >= 20 required. Blowfish ECB uses `egoroof-blowfish` (pure JS), no OpenSSL legacy provider needed.
- Game resource FPK files must be manually placed in `src/public/res/download/`; only v0282 is supported.
- Socket.IO v4 with `allowEIO3: true` for backward compatibility with the original game client (Engine.IO v3).
- Blowfish encryption key is hardcoded in `src/services/encryptionService.ts`.
- `frida/` contains Frida scripts for runtime reverse engineering of the game client (not part of the server).
- `scripts/` contains offline data conversion tools (XFS binary templates, XML→JSON, FPK packing).
