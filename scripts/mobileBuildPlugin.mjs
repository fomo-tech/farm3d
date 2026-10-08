import { createReadStream, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

// Phones use the bundled game on the same origin so saved sessions are retained.
export function mobileBuildPlugin() {
  let root;
  const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  return {
    name: 'mobile-bundled-game',
    configResolved(config) { root = resolve(config.root, config.build.outDir); },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        let pathname, url;
        try { url = new URL(req.url, 'http://localhost'); pathname = decodeURIComponent(url.pathname); } catch { return next(); }
        const mobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent'] || '');
        const entry = (mobile || url.searchParams.get('bundled') === '1') && ['/', '/index.html', '/performance.html'].includes(pathname);
        if (!entry && !pathname.startsWith('/assets/')) return next();
        const file = resolve(root, entry && pathname === '/' ? 'index.html' : pathname.slice(1));
        if (!file.startsWith(root + sep) || !existsSync(file)) return next();
        res.setHeader('Content-Type', mime[file.slice(file.lastIndexOf('.'))] || 'application/octet-stream');
        // Vite content hashes change with each build, so unchanged bundles can
        // be reused on mobile rather than downloaded again on every launch.
        const hashedAsset = !entry && /-[A-Za-z0-9_-]{8}\.(?:js|css|woff2|png|webp|jpg|svg)$/.test(pathname);
        res.setHeader('Cache-Control', hashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache');
        if (!hashedAsset) res.setHeader('Pragma', 'no-cache');
        res.setHeader('Vary', 'User-Agent');
        res.setHeader('X-Game-Build', 'mobile-bundled-v11');
        if (req.method === 'HEAD') return res.end();
        const stream = createReadStream(file);
        stream.on('error', () => { if (!res.headersSent) res.statusCode = 500; res.end(); });
        stream.pipe(res);
      });
    },
  };
}
