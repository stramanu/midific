import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRoutesConfig } from '@angular/ssr';
import { provideLottieServerOptions } from 'ngx-lottie/server';

import { baseAppConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRoutesConfig(serverRoutes),
    provideLottieServerOptions({
      preloadAnimations: {
        folder: 'dist/frontend/browser/icons',
        animations: [
          'anim-add-to-cart.json',
          'anim-theme-toggle.json',
        ],
      },
    }),
  ],
};

export const config = mergeApplicationConfig(baseAppConfig, serverConfig);
