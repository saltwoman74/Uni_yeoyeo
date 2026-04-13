import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          // dev 전용: /api/* 요청을 스텁으로 가로채 Vercel 서버리스 파일을 Vite가 ESM으로 파싱하지 않도록 함
          name: 'dev-api-stub',
          apply: 'serve',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              if (!req.url) return next();
              if (req.url.startsWith('/api/market')) {
                res.setHeader('Content-Type', 'application/json');
                res.end('{}');
                return;
              }
              if (req.url.startsWith('/api/sheets')) {
                res.setHeader('Content-Type', 'text/csv');
                res.end('');
                return;
              }
              next();
            });
          },
        },
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
