# Apypos

[![CI](https://github.com/Forgotten-MH/apypos-server/actions/workflows/ci.yml/badge.svg)](https://github.com/Forgotten-MH/apypos-server/actions/workflows/ci.yml)
[![Docker](https://github.com/Forgotten-MH/apypos-server/actions/workflows/docker.yml/badge.svg)](https://github.com/Forgotten-MH/apypos-server/actions/workflows/docker.yml)

A server emulator for **Monster Hunter Explore** (MHXR), the mobile-exclusive Monster Hunter title (iOS/Android) shut down by Capcom. Apypos handles Blowfish-encrypted HTTP API routes, real-time multiplayer via Socket.IO, and serves game resource files (FPK archives).

> [!WARNING]
> This project is in a **WIP** state. If you paid for any of this, you were scammed.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Configuration](#configuration)
- [Resource Files](#resource-files)
- [Running](#running)
- [Commands](#commands)
- [Architecture](#architecture)
- [IDs and Quests](#ids-and-quests)
- [Logging](#logging)
- [Why the Name?](#why-the-name)
- [Disclaimer](#disclaimer)
- [License](#license)

## Prerequisites

- **Node.js** >= 20
  - Via [nvm](https://github.com/nvm-sh/nvm/releases/): `nvm install 20`
  - Or [direct download](https://nodejs.org/)
- **Yarn**: `npm install -g yarn`
- **MongoDB** — either:
  - [Install locally](https://www.mongodb.com/products/self-managed/community-edition), or
  - Run `docker-compose up` (requires [Docker](https://www.docker.com/))
- **Git** (optional) — [Download](https://git-scm.com/)

## Setup

1. Clone the repository.

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run the setup script (creates `.env`, resource directories, and empty download lists):
   ```bash
   yarn setup
   ```

4. Edit `.env` with your network settings (LAN IP, MongoDB credentials, etc.).

5. (Optional) If you have a local backup of the MHXR game resources, import them:
   ```bash
   yarn setup --import-resources /path/to/res/download
   ```
   The path should contain `android/` and/or `ios/` subdirectories. This creates symlinks into the server's resource directory and the server will generate download lists with real CRC checksums on next startup.

6. (Optional) Build for production:
   ```bash
   yarn build
   ```

## Configuration

`yarn setup` copies `.env.example` to `.env` automatically. Adjust the values as needed.

> [!IMPORTANT]
> `IP`, `RES_URL`, and `WEB_URL` must be set to an IP address reachable by the game client (e.g. your LAN IP). The client runs on a mobile device or emulator and cannot reach `127.0.0.1` on the host machine.

| Variable | Default | Description |
|----------|---------|-------------|
| `IP` | `0.0.0.0` | Server bind address |
| `PORT` | `80` | Server port |
| `WEB_URL` | `http://127.0.0.1/web` | Web interface URL sent to the client — **set to your LAN IP** |
| `RES_URL` | `http://127.0.0.1/` | Resource files base URL sent to the client — **set to your LAN IP** |
| `DB_IP` | `127.0.0.1` | MongoDB host |
| `DB_PORT` | `27017` | MongoDB port |
| `DB_NAME` | `apypos` | MongoDB database name |
| `DB_USER` | `root` | MongoDB username |
| `DB_PASSWORD` | `example` | MongoDB password |
| `IS_MAINTENANCE` | `false` | Enable maintenance mode |
| `DEBUG` | `false` | Log full request/response bodies |

## Resource Files

### Game resources (FPK)

The server expects game files in `src/public/res/download/` for your platform (Android or iOS). These are FPK archives containing the game's arc files. Only **v0282** is currently supported. You can generate these FPKs by running the FPK Packer script over a backup of the game files.

The recommended way to import resources is:
```bash
yarn setup --import-resources /path/to/res/download
```

The server will start without resources (clients just won't be able to download game assets).

### Event banners

The game originally downloaded extra banners on startup for events. This is disabled by default. To enable it, populate the API in `src/controllers/bannerController.ts` and place your banner files in `src/public/res/banner/`.

## Running

Start the server in production mode:
```bash
yarn start
```

Or in dev mode with auto-reload (nodemon):
```bash
yarn run start:dev
```

The server will be available at `http://localhost:80` (or your configured port).

## Client Setup

To connect the MHXR game client to your server, the APK needs to be patched with your server's address. Use the **[online patcher](https://houmgaor.github.io/mhxr-patcher/)** — it runs entirely in your browser, no install needed.

Alternatively, the Python patcher in `scripts/patcher/` can be used offline (requires Java + apktool). See `docs/APK_PATCHING_GUIDE.md` for full details on what each patch does.

## Commands

| Command | Description |
|---------|-------------|
| `yarn setup` | Create `.env`, resource directories, and empty download lists |
| `yarn setup --import-resources <path>` | Also symlink FPK files from a local resource dump |
| `yarn install` | Install dependencies |
| `yarn run install:clean` | Clean reinstall (removes node_modules + lockfile) |
| `yarn build` | Clean and compile TypeScript to `dist/` |
| `yarn start` | Run production server |
| `yarn dev` | Run dev server (tsx, no auto-reload) |
| `yarn run start:dev` | Run dev server with nodemon (auto-reload) |
| `yarn test` | Run tests (vitest) |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage |
| `yarn lint` | Lint source files (ESLint) |
| `yarn format` | Format source files (Prettier) |
| `yarn fpk` | FPK/ARC/XFS archive tool (pack, unpack, convert) |
| `yarn proxy` | MITM proxy for recording/replaying MHXR traffic |
| `yarn generate-island` | Generate ocean/island data |
| `yarn generate-questList` | Generate quest list |
| `yarn bf-dec` | Test Blowfish decryption |

## Architecture

```
Client (Android/iOS)
  |  Blowfish ECB encrypted HTTP (application/octet-stream)
  v
Express Server (src/server.ts)
  ├── Decrypt middleware (Blowfish ECB -> JSON)
  ├── Input sanitization (strips MongoDB $ operators)
  ├── API route groups (src/routes/api/)
  ├── Encrypt response (JSON -> Blowfish ECB)
  └── Static file serving (FPK game resources)
  |
  v
MongoDB (via Mongoose ODM)
```

Multiplayer is handled by Socket.IO (`src/multiServer.ts`) with a 16-byte binary packet header format for room-based sessions.

### Project Structure

```
src/
├── server.ts           # Entry point
├── app.ts              # Express app setup + middleware
├── config.ts           # Environment configuration
├── multiServer.ts      # Socket.IO multiplayer server
├── routes/             # API routes (api/, version/, maintenance/, web/)
├── model/              # Mongoose schemas (user, guild, quests, events, etc.)
├── services/           # Business logic (quests, items, guilds, ocean, crypto)
├── csv/                # Quest master data (CSV)
├── json/               # Quest DB, event definitions, node configs (JSON)
├── bin/                # CLI utilities
└── public/res/         # Static game resources (FPK, banners)
frida/                  # Frida scripts for runtime client analysis
scripts/                # Offline data conversion tools (XFS, XML->JSON, FPK)
```

## IDs and Quests

Most IDs can be found in the game files under `arc_cmn/resident`. You'll need to extract the arcs and convert the XFS files to XML using a tool like [Revil Toolkit](https://github.com/PredatorCZ/RevilLib).

## Logging

This project uses [Winston](https://github.com/winstonjs/winston). Logs are displayed in the console in the format:

```
Request: [HTTP_METHOD] [URL] | Response: [STATUS_CODE] [RESPONSE_TIME]ms
```

Set `DEBUG=true` in `.env` to log full request and response bodies.

## Why the Name?

The server is named after the in-game Guild character. It was originally called "Boromir" — randomly chosen by the initial framework developer who hadn't played the game when it was live. It was renamed because the Lord of the Rings association didn't fit Monster Hunter, and the original name may have been a localization error. The name follows the convention set by [Erupe](https://github.com/ZeruLight/Erupe), the MH Frontier server emulator.

## Disclaimer

This project is an unofficial, fan-made private server created for educational and preservation purposes only. It is not affiliated with, endorsed by, or connected to Capcom or its affiliates. All trademarks and copyrights related to MHXR are the property of their respective owners.

This server and its associated software are provided "AS IS," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. The developers and contributors are not responsible for any damages, losses, or legal consequences arising from the use of this software.

Use of this server may violate the terms of service of Capcom and could result in suspension or banning from official services. Users assume all risk and responsibility.

## License

This project is licensed under the [AGPL-3.0 License](./LICENSE).

If you modify this software and make it available to others over a network (for example, by hosting a web service), you must provide the complete source code of your modified version to all users of that service, per the AGPL terms.
