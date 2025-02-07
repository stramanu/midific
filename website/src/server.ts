import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import auth from 'basic-auth';
import cors from 'cors';
import http from 'http';
import https from 'https';
import { provideServerRendering } from '@angular/platform-server';
import cookieParser from 'cookie-parser';
import compression from 'compression';


http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine()

app.use(cookieParser());

app.use(compression());

if (process.env['PRODUCTION'] == "true") {
  app.use(cors({
    origin: [
      "https://midific.com",
      "https://www.midific.com",
      "https://api.midific.com"
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }));
  const admin = { 
    name: 'admin',
    password: 'MidDem24@'
  }
  app.use((req, res, next) => {
    const user = auth(req)
    if (!user || !admin.name || admin.password !== user.pass) {
      res.set('WWW-Authenticate', 'Basic realm="authorization"')
      return res.status(401).send()
    }
    return next()
  });
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application. Added support for server-side rendering cookies.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req, {
      providers: [
        provideServerRendering(),
        { provide: 'REQUEST', useValue: req },
        { provide: 'RESPONSE', useValue: res },
      ],
    })
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});


/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;

  app.listen({
    port,
    host: '0.0.0.0'
  }, () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
