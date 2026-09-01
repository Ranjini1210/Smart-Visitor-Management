import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import appModule, { app as rawApp } from './server/src/app';
import { initializeDatabase } from './server/src/database/db';
import { seedData } from './server/src/database/seed';

const PORT = 3000;

// Resolve express application reliably across ESM/CJS bundles
const app = (rawApp && typeof rawApp.use === 'function')
  ? rawApp
  : (appModule && typeof (appModule as any).use === 'function')
  ? appModule
  : (appModule as any)?.default || express();

async function startServer() {
  await initializeDatabase();
  await seedData();

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), 'vite.config.ts'),
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback SPA routing for Vite development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Do not catch /api routes that 404
      if (url.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
      }

      try {
        const indexPath = path.resolve(process.cwd(), 'client/index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Visitor Management System running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

