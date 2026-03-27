import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

@Controller()
export class WidgetServeController {
  @Get('widget.js')
  serveWidget(@Res() res: Response) {
    const cwd = process.cwd();
    const paths = [
      join(cwd, 'packages', 'widget', 'dist', 'widget.iife.js'),
      join(cwd, '..', 'packages', 'widget', 'dist', 'widget.iife.js'),
      join(cwd, '..', '..', 'packages', 'widget', 'dist', 'widget.iife.js'),
      join(cwd, '..', 'widget', 'dist', 'widget.iife.js'),
    ];
    for (const p of paths) {
      if (existsSync(p)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return createReadStream(p).pipe(res);
      }
    }
    res.status(404).send('Widget not found. Run: npm run build -w widget');
  }
}
