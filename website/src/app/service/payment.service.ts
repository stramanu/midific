import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { MidiDto } from 'common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { lastValueFrom, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { StripeFactoryService, StripeInstance } from 'ngx-stripe';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private api = inject(ApiService);
  private stripeFactory = inject(StripeFactoryService);
  private stripe = this.stripeFactory.create(environment.stripe.key) as StripeInstance;

  constructor() {
  }

  
  /************************************************************************
  *                             Stripe API
  ************************************************************************/

  public async createCheckoutSession(midiSlugs: string[]) {
    return await this.api.createCheckoutSession(this.stripe, midiSlugs);
  }

}
