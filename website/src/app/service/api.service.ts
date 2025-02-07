import { Injectable, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { MidiDto } from 'common';
import { lastValueFrom, ReplaySubject, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { StripeInstance } from 'ngx-stripe';

interface IStripeSession {
  id: string;
}

export interface PaymentIntent {
  client_secret: string;
}

interface GetOptions {
  url: string, 
  params: {
    [param: string]: string | number | boolean | readonly (string | number | boolean)[]
  }, 
  abortSignal?: AbortSignal
}

interface PostOptions {
  url: string, 
  body: any, 
  abortSignal?: AbortSignal
}

interface CacheEntry {
  subject: ReplaySubject<any>;
  timeoutId: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private transferState = inject(TransferState);
  private cache = new Map<string, CacheEntry>();
  private MAX_CACHE_SIZE = 50;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minuti

  public get API_URL_SSR() {
    return this.isPlatformBrowser ? environment.api.url.base : environment.api.url.ssr;
  }

  public get API_URL() {
    return environment.api.url.base;
  }

  private getCacheKey(url: string, params?: any) {
    return `${url}?${new URLSearchParams(params).toString()}`;
  }

  private cleanupCache() {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey!);
    }
  }

  public async get<T>(opt: GetOptions): Promise<T> {
    const cacheKey = this.getCacheKey(opt.url, opt.params);
    const stateKey = makeStateKey<T>(cacheKey);

    if (this.transferState.hasKey(stateKey)) {
      const data = this.transferState.get<T>(stateKey, null as any);
      this.transferState.remove(stateKey);
      return data;
    }

    if (this.cache.has(cacheKey)) {
      return lastValueFrom(this.cache.get(cacheKey)!.subject);
    }

    const subject = new ReplaySubject<T>(1);
    const timeoutId = setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);
    this.cache.set(cacheKey, { subject, timeoutId });
    this.cleanupCache();

    const url = new URL(opt.url);
    if (opt.params) {
      url.search = new URLSearchParams(Object.fromEntries(Object.entries(opt.params).map(([key, value]) => [key, String(value)]))).toString();
    }

    try {
      const response = await fetch(url.toString(), { signal: opt.abortSignal });
      const data = await response.json();
      if (!this.isPlatformBrowser) {
        this.transferState.set(stateKey, data);
      }
      subject.next(data);
      subject.complete();
      return data;
    } catch (error) {
      subject.error(error);
      throw error;
    }
  }

  public async post<T>(opt: PostOptions): Promise<T> {
    const response = await fetch(opt.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opt.body),
      signal: opt.abortSignal
    });
    return response.json();
  }


  /*
  * Payment API
  */
  // public async createCheckoutSession(stripe: StripeInstance, midiSlugs: string[]) {
  //   return await lastValueFrom(this.post({
  //     url: `${this.API_URL_SSR}/payment/checkout-session-create`,
  //     body: {
  //       slugs: midiSlugs
  //     }
  //   },{
  //     observe: 'response'
  //   }).pipe(switchMap((response: HttpResponse<Object>) => {
  //     const session = response.body as IStripeSession;
  //     // If `redirectToCheckout` fails due to a browser or network
  //     return stripe.redirectToCheckout({ sessionId: session.id });
  //   })))
  // }

  public async createPaymentIntent(midiSlugs: string[]) {
    return await this.post<PaymentIntent>({
      url: `${this.API_URL}/payment/intent-create`,
      body: {
        midiSlugs
      }
    })
  }

  /*
  * Midi API
  */

  public async getRelatedMidi(
    slug: string, 
    page = 0, 
    limit = 10, 
    exclude: string[] = [],
    abortSignal?: AbortSignal,
  ) {
    return await this.get<MidiDto[]>({
      url: `${this.API_URL_SSR}/midi/${slug}/related`,
      params: {
        page,
        limit,
        exclude: JSON.stringify(exclude)
      },
      abortSignal
    })
  }

  public async getUserRelatedMidi(
    page = 0,
    limit = 6,
    exclude: string[] = [],
    abortSignal?: AbortSignal,
  ) {
    return await this.get<MidiDto[]>({
      url: `${this.API_URL_SSR}/midi/user-related`,
      params: {
        page,
        limit,
        exclude: JSON.stringify(exclude)
      },
      abortSignal
    })
  }

  public async latestMidi(
    page = 0,
    limit = 10,
    exclude: string[] = [],
    abortSignal?: AbortSignal,
  ) {
    return await this.get<MidiDto[]>({
      url: `${this.API_URL_SSR}/midi/latest`,
      params: {
        page,
        limit,
        exclude: JSON.stringify(exclude)
      },
      abortSignal
    })
  }

  public async searchMidi(query: string, page = 0, limit = 10) {
    return await this.get<MidiDto[]>({
      url: `${this.API_URL_SSR}/midi/search`,
      params: {
        query,
        page,
        limit
      }
    })
  }

  public async getMidi(slug: string) {
    return await this.get<MidiDto>({
      url: `${this.API_URL_SSR}/midi/${slug}`,
      params: {}
    })
  }

  public async getMidiFile(slug: string) {
    return await this.get<string>({
      url: `${this.API_URL_SSR}/midi/${slug}/file`,
      params: {}
    })
  }

}
