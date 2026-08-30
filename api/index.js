import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

let cachedApp = null;

function getApp() {
  if (cachedApp) return cachedApp;

  const candidates = [
    '../dist/server.cjs',
    path.join(process.cwd(), 'dist', 'server.cjs'),
    path.resolve(process.cwd(), 'dist', 'server.cjs'),
    './dist/server.cjs',
  ];

  for (const target of candidates) {
    try {
      const mod = require(target);
      cachedApp = mod.default || mod.app || mod;
      if (typeof cachedApp === 'function') {
        return cachedApp;
      }
    } catch {
      // Try next location
    }
  }

  // Final fallback to direct relative path
  try {
    const directMod = require('../dist/server.cjs');
    cachedApp = directMod.default || directMod.app || directMod;
    return cachedApp;
  } catch (err) {
    console.error('[Vercel Serverless] Failed to load compiled server:', err);
    throw err;
  }
}

export default function handler(req, res) {
  const app = getApp();
  return app(req, res);
}
