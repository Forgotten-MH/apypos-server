import * as fs from 'node:fs';
import { createLogger } from '../middleware/logger.js';
import type { ModificationRule } from './types.js';

const log = createLogger('proxy:rules');

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];
    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else {
      result[key] = sourceVal;
    }
  }
  return result;
}

export class RuleEngine {
  private rules: ModificationRule[] = [];
  private rulesPath: string | null = null;
  private watcher: fs.FSWatcher | null = null;

  constructor(rulesPath?: string) {
    if (rulesPath) {
      this.rulesPath = rulesPath;
      this.loadRules();
      this.watchRules();
    }
  }

  private loadRules(): void {
    if (!this.rulesPath) return;
    try {
      const raw = fs.readFileSync(this.rulesPath, 'utf-8');
      this.rules = JSON.parse(raw) as ModificationRule[];
      log.info(`Loaded ${this.rules.length} rules from ${this.rulesPath}`);
    } catch (err) {
      log.error(`Failed to load rules from ${this.rulesPath}:`, err);
      this.rules = [];
    }
  }

  private watchRules(): void {
    if (!this.rulesPath) return;
    try {
      this.watcher = fs.watch(this.rulesPath, (eventType) => {
        if (eventType === 'change') {
          log.info('Rules file changed, reloading...');
          this.loadRules();
        }
      });
    } catch {
      log.warn('Could not watch rules file for changes');
    }
  }

  /**
   * Apply matching rules to a response body. Returns [modified body, wasModified].
   */
  apply(url: string, body: Record<string, unknown>): [Record<string, unknown>, boolean] {
    let result = body;
    let modified = false;

    for (const rule of this.rules) {
      if (!this.matchUrl(url, rule.urlPattern)) continue;

      log.info(`Rule matched: "${rule.description ?? rule.urlPattern}" on ${url}`);

      if (rule.replace) {
        result = { ...rule.replace };
        modified = true;
      } else if (rule.patch) {
        result = deepMerge(result, rule.patch);
        modified = true;
      }
    }

    return [result, modified];
  }

  private matchUrl(url: string, pattern: string): boolean {
    // Exact match first
    if (url === pattern) return true;

    // Try as regex if it contains regex-like characters
    if (pattern.includes('*') || pattern.includes('(') || pattern.startsWith('^')) {
      try {
        return new RegExp(pattern).test(url);
      } catch {
        return false;
      }
    }

    // Prefix match (pattern without trailing slash matches URLs with query strings)
    return url.startsWith(pattern);
  }

  get ruleCount(): number {
    return this.rules.length;
  }

  close(): void {
    this.watcher?.close();
  }
}
