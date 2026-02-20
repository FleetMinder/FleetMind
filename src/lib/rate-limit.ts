// Rate limiter in-memory (per serverless, funziona per singola istanza)
// Per produzione ad alto traffico, usare Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Pulisci entry scadute ogni 5 minuti
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key);
  });
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;   // Max richieste nel periodo
  windowMs: number;      // Finestra temporale in millisecondi
}

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  // Se non esiste o è scaduta, crea nuova entry
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, retryAfterMs: 0 };
  }

  // Se ha superato il limite
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  // Incrementa
  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, retryAfterMs: 0 };
}

// Config per login: max 5 richieste ogni 15 minuti per email
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minuti
};

// Config per login: max 10 richieste ogni 15 minuti per IP
export const LOGIN_IP_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
};
