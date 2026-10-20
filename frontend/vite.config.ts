import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'image-proxy',
        configureServer(server) {
          server.middlewares.use('/api/proxy-image', async (req, res) => {
            try {
              const urlObj = new URL(req.url || '', 'http://localhost');
              const targetUrl = urlObj.searchParams.get('url');
              if (!targetUrl) {
                res.statusCode = 400;
                res.end('Missing url param');
                return;
              }
              const response = await fetch(targetUrl);
              const contentType = response.headers.get('content-type') || 'image/png';
              res.setHeader('Content-Type', contentType);
              res.setHeader('Access-Control-Allow-Origin', '*');
              const arrayBuffer = await response.arrayBuffer();
              res.end(Buffer.from(arrayBuffer));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(err?.message || 'Proxy error');
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,
      allowedHosts: true as true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

