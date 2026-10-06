// Development-only, same-origin numeric diagnostics. No account, chat or location data.
export function mobileDiagnosticsPlugin() {
  const samples = [];
  return {
    name: 'mobile-diagnostics',
    configureServer(server) {
      server.middlewares.use('/__mobile-diagnostics', (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'GET') { res.end(JSON.stringify(samples)); return; }
        if (req.method !== 'POST') { res.statusCode = 405; res.end('{}'); return; }
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) {
          res.statusCode = 403; res.end('{}'); return;
        }
        let body = '', rejected = false;
        req.on('data', chunk => {
          if (rejected) return;
          body += chunk;
          if (Buffer.byteLength(body) > 4096) { rejected = true; res.statusCode = 413; res.end('{}'); }
        });
        req.on('end', () => {
          if (rejected) return;
          try {
            const input = JSON.parse(body), sample = { receivedAt: new Date().toISOString() };
            for (const key of ['buildRevision','time','fps','meshes','textures','materials','geometries','activeMeshes','bootStageCode','foliagePlacements','foliageDetailBatches','foliageLodBatches','schedulerPending','renderWidth','renderHeight','renderDpr','layoutWidth','layoutHeight','rootX','rootY','rootWidth','rootHeight','canvasX','canvasY','canvasWidth','canvasHeight','viewportWidth','viewportHeight','viewportLeft','viewportTop','viewportScale','nativeDpr','pending','maxStepMs']) {
              if (Number.isFinite(input[key])) sample[key] = input[key];
            }
            sample.previousSession = input.previousSession === true;
            sample.ready = input.ready === true;
            sample.contextLost = input.contextLost === true;
            samples.push(sample);
            if (samples.length > 120) samples.shift();
            res.end('{"ok":true}');
          } catch { res.statusCode = 400; res.end('{}'); }
        });
      });
    },
  };
}
