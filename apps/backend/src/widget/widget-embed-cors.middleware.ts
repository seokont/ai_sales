import { Request, Response, NextFunction } from 'express';

/** Public embed routes: any site may load widget.js and call /widget/* with the company API key. */
export function applyWidgetEmbedCors(req: Request, res: Response, next: NextFunction): void {
  const pathname = req.path || req.url?.split('?')[0] || '';
  if (pathname !== '/widget.js' && !pathname.startsWith('/widget')) {
    next();
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}
