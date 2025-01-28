import { ApplicationConfig, StaticProvider, inject, mergeApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { InMemoryScrollingFeature, InMemoryScrollingOptions, ViewTransitionInfo, provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withIncrementalHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideNgxStripe } from 'ngx-stripe';
import { onViewTransitionCreated } from './transition/transition';
import { provideLottieOptions } from 'ngx-lottie';
import { environment } from '../environments/environment';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);


export const baseAppConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      inMemoryScrollingFeature,
      withComponentInputBinding()
    ),
    provideClientHydration(
      withIncrementalHydration()
      // withHttpTransferCacheOptions({
      //   includePostRequests: true
      // })
    ),
    provideHttpClient(withFetch()),
    provideNgxStripe(),
    provideLottieOptions({
      player: () => import('lottie-web')
    })
  ],
};

export const appConfig: ApplicationConfig = mergeApplicationConfig(baseAppConfig, {
  providers: [
    provideRouter(
      routes,
      inMemoryScrollingFeature, 
      withComponentInputBinding(),
      withViewTransitions({ onViewTransitionCreated }))
  ]
});
