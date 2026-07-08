import apiClient from './apiClient';

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const createEntry = (level, message, meta = {}) => ({
  level,
  message,
  url: window.location.href,
  user_agent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  ...meta,
});

const isProduction = import.meta.env.PROD;

const buffer = [];
let flushTimer = null;

const flush = () => {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  apiClient.post('/log/client-error/', { errors: batch }).catch(() => {});
};

const enqueue = (entry) => {
  buffer.push(entry);
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();
    }, 3000);
  }
};

const log = (level, message, meta) => {
  const entry = createEntry(level, message, meta);
  if (!isProduction) {
    const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(`[${level}] ${message}`, meta);
  }
  if (level !== 'DEBUG' || isProduction) {
    enqueue(entry);
  }
};

export const logger = {
  debug: (msg, meta) => log('DEBUG', msg, meta),
  info: (msg, meta) => log('INFO', msg, meta),
  warn: (msg, meta) => log('WARN', msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta),
  captureException: (error, meta = {}) => {
    const entry = createEntry('ERROR', error?.message || String(error), {
      ...meta,
      stack: error?.stack,
      name: error?.name,
    });
    if (!isProduction) {
      console.error('[CAPTURED]', error);
    }
    enqueue(entry);
  },
  flush,
};

export const initGlobalHandlers = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    logger.captureException(error || new Error(String(message)), {
      source,
      lineno,
      colno,
      handler: 'onerror',
    });
  };

  window.onunhandledrejection = (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    logger.captureException(error, { handler: 'unhandledrejection' });
  };
};
