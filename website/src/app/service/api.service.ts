import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { MidiDto } from 'common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { lastValueFrom, switchMap } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private window = inject(DOCUMENT).defaultView!;

  private http = inject(HttpClient)

  public get API_URL_SSR() {
    return this.isPlatformBrowser ? environment.api.url.base : environment.api.url.ssr;
  }

  public get API_URL() {
    return environment.api.url.base;
  }

  constructor() {
    if (this.isPlatformBrowser) (this.window as any).ApiService = this;
  }

  /*
  * fetch get interface
  */
  public async get<T>(opt: GetOptions) {
    const url = new URL(opt.url)
     url.search = new URLSearchParams(Object.fromEntries(Object.entries(opt.params).map(([key, value]) => [key, String(value)]))).toString();
    const response = await fetch(url.toString(), {
      signal: opt.abortSignal
    })
    return response.json() as Promise<T>
  }

  /*
  * fetch post interface
  */
  public async post<T>(opt: PostOptions) {
    const response = await fetch(opt.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(opt.body),
      signal: opt.abortSignal
    })
    return response.json() as Promise<T>
  }


  /*
  * Payment API
  */
  public async createCheckoutSession(stripe: StripeInstance, midiSlugs: string[]) {
    return await lastValueFrom(this.http.post(`${this.API_URL_SSR}/payment/checkout-session-create`, {
      slugs: midiSlugs
    },{
      observe: 'response'
    }).pipe(switchMap((response: HttpResponse<Object>) => {
      const session = response.body as IStripeSession;
      // If `redirectToCheckout` fails due to a browser or network
      return stripe.redirectToCheckout({ sessionId: session.id });
    })))
  }

  public async createPaymentIntent(midiSlugs: string[]) {
    return await lastValueFrom(this.http.post<PaymentIntent>(`${this.API_URL}/payment/intent-create`, {
      midiSlugs
    }))
  }

  /*
  * Midi Image API
  */

  public getMidiImage(midi: MidiDto, sizes: { x: number, y: number }) {
    return `${this.API_URL}/midi/image/${midi.slug}/${sizes.x}x${sizes.y}.webp`;
  }


  /*
  * Midi API
  */

  public async getUserRelatedMidi(
    page = 0,
    limit = 6,
    exclude: string[] = [],
  ) {
    return await lastValueFrom(this.http.get<MidiDto[]>(`${this.API_URL_SSR}/midi/user-related`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        exclude: JSON.stringify(exclude)
      }
    }))
  }

  public async latestMidi(
    page = 0,
    limit = 10,
    exclude: string[] = [],
  ) {
    return await lastValueFrom(this.http.get<MidiDto[]>(`${this.API_URL_SSR}/midi/latest`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        exclude: JSON.stringify(exclude)
      }
    }))
  }

  public async searchMidi(query: string, page = 0, limit = 10) {
    return await lastValueFrom(this.http.get<MidiDto[]>(`${this.API_URL_SSR}/midi/search`, {
      params: {
        query,
        page: page.toString(),
        limit: limit.toString()
      }
    }))
  }

  public async getMidi(slug: string) {
    return await lastValueFrom(this.http.get<MidiDto>(`${this.API_URL_SSR}/midi/${slug}`))
  }

  public async getRelatedMidi(
    slug: string, 
    page = 0, 
    limit = 10, 
    exclude: string[] = [],
    abortSignal?: AbortSignal,
  ) {
    // return await lastValueFrom(this.http.get<MidiDto[]>(`${this.API_URL_SSR}/midi/${slug}/related`, {
    //   params: {
    //     page: page.toString(),
    //     limit: limit.toString()
    //   },
    // }))
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

  public async getMidiFile(slug: string) {
    return await lastValueFrom(this.http.post(`${this.API_URL}/midi/file`, {
      slug
    }, {
      responseType: 'text'
    }))
  }

}
