export type ProxyMode = 'record' | 'replay' | 'live';

export interface RecordedExchange {
  seq: number;
  timestamp: string;
  url: string;
  method: string;
  requestBody: unknown;
  responseStatus: number;
  responseBody: unknown;
  isEncrypted: boolean;
  durationMs: number;
}

export interface RecordedSession {
  id: string;
  startedAt: string;
  upstreamUrl: string;
  exchanges: RecordedExchange[];
}

export interface ModificationRule {
  urlPattern: string;
  description?: string;
  patch?: Record<string, unknown>;
  replace?: Record<string, unknown>;
}

export interface ProxyConfig {
  mode: ProxyMode;
  port: number;
  upstream: string;
  recordingFile?: string;
  rulesFile?: string;
  verbose: boolean;
}
