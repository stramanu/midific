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

  public async forYouMidi(page = 0, limit = 6) {
    return await lastValueFrom(this.http.get<MidiDto[]>(`${this.API_URL_SSR}/midi/for-you`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    }))
  }

  public async latestMidi(page = 0, limit = 10) {
    return await lastValueFrom(this.http.get<MidiDto[]>(`${this.API_URL_SSR}/midi/latest`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
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

  public async getRelatedMidi(slug: string, page = 0, limit = 10) {
    return await lastValueFrom(this.http.get<MidiDto[]>(`${this.API_URL_SSR}/midi/${slug}/related`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    }))
  }

  public async getMidiFile(slug: string) {
    return await lastValueFrom(this.http.post(`${this.API_URL}/midi/file`, {
      slug
    }, {
      responseType: 'text'
    }))
  }

}
