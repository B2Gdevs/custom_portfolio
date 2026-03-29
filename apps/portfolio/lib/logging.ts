type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
type LogRuntime = 'client' | 'server';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const REDACTED_LABEL = '[redacted]';
const TRUNCATED_LABEL = '…';
const MAX_BUFFER_SIZE = 200;
const MAX_ARRAY_ITEMS = 10;
const MAX_OBJECT_KEYS = 24;
const MAX_STRING_LENGTH = 400;
const MAX_DEPTH = 4;
const SENSITIVE_KEY_PATTERN =
  /authorization|api[-_]?key|password|secret|token|cookie|session|bearer/i;

export interface LogEntry {
  timestamp: string;
  runtime: LogRuntime;
  scope: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

interface CreateLoggerOptions {
  runtime?: LogRuntime;
  defaultLevel?: LogLevel;
}

export interface Logger {
  scope: string;
  runtime: LogRuntime;
  isEnabled(level: LogLevel): boolean;
  child(scope: string): Logger;
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

declare global {
  interface Window {
    __PORTFOLIO_LOGS__?: LogEntry[];
  }

  var __PORTFOLIO_LOGS__: LogEntry[] | undefined;
}

function normalizeLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  const normalized = value?.trim().toLowerCase();
  if (normalized && normalized in LOG_LEVELS) {
    return normalized as LogLevel;
  }

  return fallback;
}

function getDefaultLevel(runtime: LogRuntime): LogLevel {
  if (process.env.NODE_ENV === 'development') {
    return runtime === 'client' ? 'info' : 'info';
  }

  return 'warn';
}

function parseScopeFilter(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function getRuntime(optionsRuntime?: LogRuntime): LogRuntime {
  if (optionsRuntime) {
    return optionsRuntime;
  }

  return typeof window === 'undefined' ? 'server' : 'client';
}

function getConfiguredLevel(runtime: LogRuntime, fallback: LogLevel) {
  const envValue =
    runtime === 'client'
      ? process.env.NEXT_PUBLIC_LOG_LEVEL
      : process.env.LOG_LEVEL ?? process.env.NEXT_PUBLIC_LOG_LEVEL;

  return normalizeLevel(envValue, fallback);
}

function getConfiguredScopes(runtime: LogRuntime) {
  const envValue =
    runtime === 'client'
      ? process.env.NEXT_PUBLIC_LOG_SCOPES
      : process.env.LOG_SCOPES ?? process.env.NEXT_PUBLIC_LOG_SCOPES;

  return parseScopeFilter(envValue);
}

function matchesScope(scope: string, filter: string) {
  return filter === '*' || scope === filter || scope.startsWith(`${filter}.`);
}

function shouldEmit(scope: string, runtime: LogRuntime, level: LogLevel, defaultLevel?: LogLevel) {
  const minimumLevel = getConfiguredLevel(runtime, defaultLevel ?? getDefaultLevel(runtime));
  if (LOG_LEVELS[level] < LOG_LEVELS[minimumLevel]) {
    return false;
  }

  const scopeFilters = getConfiguredScopes(runtime);
  if (scopeFilters.length === 0) {
    return true;
  }

  return scopeFilters.some((filter) => matchesScope(scope, filter));
}

function truncateString(value: string) {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}${TRUNCATED_LABEL}`;
}

function sanitizeValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return truncateString(value);
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: truncateString(value.stack ?? ''),
    };
  }

  if (depth >= MAX_DEPTH) {
    return '[max-depth]';
  }

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1, seen));
    if (value.length > MAX_ARRAY_ITEMS) {
      items.push(`[+${value.length - MAX_ARRAY_ITEMS} more]`);
    }
    return items;
  }

  if (typeof value === 'object') {
    if (seen.has(value as object)) {
      return '[circular]';
    }

    seen.add(value as object);

    const output: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_OBJECT_KEYS);
    for (const [key, entryValue] of entries) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        output[key] = REDACTED_LABEL;
        continue;
      }

      output[key] = sanitizeValue(entryValue, depth + 1, seen);
    }

    const totalKeys = Object.keys(value as Record<string, unknown>).length;
    if (totalKeys > MAX_OBJECT_KEYS) {
      output.__truncatedKeys = totalKeys - MAX_OBJECT_KEYS;
    }

    return output;
  }

  return String(value);
}

function getBufferTarget(runtime: LogRuntime) {
  if (runtime === 'client' && typeof window !== 'undefined') {
    window.__PORTFOLIO_LOGS__ ??= [];
    return window.__PORTFOLIO_LOGS__;
  }

  globalThis.__PORTFOLIO_LOGS__ ??= [];
  return globalThis.__PORTFOLIO_LOGS__;
}

function pushEntry(entry: LogEntry) {
  const buffer = getBufferTarget(entry.runtime);
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
  }
}

function getConsoleMethod(level: LogLevel) {
  switch (level) {
    case 'debug':
      return console.debug.bind(console);
    case 'info':
      return console.info.bind(console);
    case 'warn':
      return console.warn.bind(console);
    case 'error':
      return console.error.bind(console);
    default:
      return console.log.bind(console);
  }
}

function emit(entry: LogEntry) {
  pushEntry(entry);

  const consoleMethod = getConsoleMethod(entry.level);
  const prefix = `[portfolio][${entry.runtime}][${entry.scope}][${entry.level}] ${entry.message}`;

  if (typeof entry.data === 'undefined') {
    consoleMethod(prefix);
    return;
  }

  consoleMethod(prefix, entry.data);
}

export function getRecentLogs(runtime?: LogRuntime) {
  const resolvedRuntime = getRuntime(runtime);
  return [...getBufferTarget(resolvedRuntime)];
}

export function createLogger(scope: string, options: CreateLoggerOptions = {}): Logger {
  const runtime = getRuntime(options.runtime);
  const fallbackLevel = options.defaultLevel ?? getDefaultLevel(runtime);

  function log(level: LogLevel, message: string, data?: unknown) {
    if (!shouldEmit(scope, runtime, level, fallbackLevel)) {
      return;
    }

    emit({
      timestamp: new Date().toISOString(),
      runtime,
      scope,
      level,
      message,
      data: typeof data === 'undefined' ? undefined : sanitizeValue(data),
    });
  }

  return {
    scope,
    runtime,
    isEnabled(level: LogLevel) {
      return shouldEmit(scope, runtime, level, fallbackLevel);
    },
    child(childScope: string) {
      return createLogger(`${scope}.${childScope}`, { runtime, defaultLevel: fallbackLevel });
    },
    debug(message: string, data?: unknown) {
      log('debug', message, data);
    },
    info(message: string, data?: unknown) {
      log('info', message, data);
    },
    warn(message: string, data?: unknown) {
      log('warn', message, data);
    },
    error(message: string, data?: unknown) {
      log('error', message, data);
    },
  };
}
