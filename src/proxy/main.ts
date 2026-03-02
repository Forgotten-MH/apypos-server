import { createProxyApp } from './proxyServer.js';
import { createLogger } from '../middleware/logger.js';
import type { ProxyConfig, ProxyMode } from './types.js';

const log = createLogger('proxy:main');

function printUsage(): void {
  console.log(`
MHXR MITM Proxy

Usage:
  yarn proxy record  [--upstream URL] [--port PORT] [--verbose]
  yarn proxy replay  <recording.json> [--port PORT] [--verbose]
  yarn proxy live    [--upstream URL] [--rules FILE] [--port PORT] [--verbose]

Modes:
  record    Proxy to upstream, record all decrypted traffic
  replay    Serve responses from a recording file
  live      Proxy to upstream with modification rules

Options:
  --upstream URL   Upstream server URL (default: http://localhost:9080)
  --port PORT      Proxy listen port (default: 8080)
  --rules FILE     Rules JSON file for live mode
  --verbose        Log full decrypted request/response bodies
`);
}

function parseArgs(argv: string[]): ProxyConfig | null {
  // argv[0] = node, argv[1] = script, argv[2] = mode, ...
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return null;
  }

  const mode = args[0] as ProxyMode;
  if (!['record', 'replay', 'live'].includes(mode)) {
    console.error(`Unknown mode: ${args[0]}`);
    printUsage();
    return null;
  }

  const config: ProxyConfig = {
    mode,
    port: 8080,
    upstream: 'http://localhost:9080',
    verbose: false,
  };

  let i = 1;
  while (i < args.length) {
    const arg = args[i]!;
    switch (arg) {
      case '--upstream':
        config.upstream = args[++i] ?? config.upstream;
        break;
      case '--port':
        config.port = parseInt(args[++i] ?? '8080', 10);
        break;
      case '--rules':
        config.rulesFile = args[++i];
        break;
      case '--verbose':
        config.verbose = true;
        break;
      default:
        // Positional arg — for replay mode, it's the recording file
        if (mode === 'replay' && !config.recordingFile) {
          config.recordingFile = arg;
        } else {
          console.error(`Unknown argument: ${arg}`);
          printUsage();
          return null;
        }
    }
    i++;
  }

  // Validate
  if (mode === 'replay' && !config.recordingFile) {
    console.error('Replay mode requires a recording file');
    printUsage();
    return null;
  }

  return config;
}

function main(): void {
  const config = parseArgs(process.argv);
  if (!config) {
    process.exit(1);
  }

  log.info(`Starting MHXR MITM Proxy in ${config.mode} mode`);
  log.info(`  Port: ${config.port}`);
  if (config.mode !== 'replay') {
    log.info(`  Upstream: ${config.upstream}`);
  }
  if (config.rulesFile) {
    log.info(`  Rules: ${config.rulesFile}`);
  }
  if (config.recordingFile) {
    log.info(`  Recording: ${config.recordingFile}`);
  }

  const { app, state } = createProxyApp(config);

  const server = app.listen(config.port, () => {
    log.info(`MHXR MITM Proxy listening on port ${config.port}`);
  });

  // Graceful shutdown — flush recording on exit
  function shutdown() {
    log.info('Shutting down...');
    if (state.recorder && state.recorder.exchangeCount > 0) {
      state.recorder.flush();
    }
    state.ruleEngine?.close();
    server.close();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
