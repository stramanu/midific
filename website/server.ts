import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express, { Request, Response } from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { REQUEST, RESPONSE_INIT, StaticProvider } from '@angular/core';
import auth from 'basic-auth';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  server.use(cors())

  if (process.env['PRODUCTION'] == "true") {
    const admin = { 
      name: 'admin',
      password: 'MidDem24@'
    }
    server.use((req, res, next) => {
      const user = auth(req)
      if (!user || !admin.name || admin.password !== user.pass) {
        res.set('WWW-Authenticate', 'Basic realm="authorization"')
        return res.status(401).send()
      }
      return next()
    });
  }

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);


  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { 
            provide: APP_BASE_HREF,
            useValue: baseUrl
          },{
            provide: REQUEST,
            useValue: req
          },{
            provide: RESPONSE_INIT,
            useValue: res
          }
        ]
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  // const httpsOptions = {
  //   key: fs.readFileSync('./security/cert.key'),
  //   cert: fs.readFileSync('./security/cert.pem')
  // }
  // const server = https.createServer(httpsOptions, app()).listen(port, () => {
  //   console.log('server running at ' + port)
  // })process.env['PRODUCTION'] == "true"
  app().listen({
    port,
    host: '0.0.0.0'
  }, () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

run();
