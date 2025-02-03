import { Component, Input, OnInit, ViewChild, WritableSignal, inject, signal, viewChild } from '@angular/core';
import { AppService } from '../../service/app.service';
import { StorageService } from '../../service/storage.service';
import { MidiImgComponent } from '../../core/midi-img/midi-img.component';
import { PlayButtonComponent } from '../../core/play-button/play-button.component';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MidiCartDto, MidiDto, UserDto } from 'common';
import { PaymentService } from '../../service/payment.service';
import { MidiListComponent } from '../../core/midi-list/midi-list.component';
import { NgOptimizedImage } from '@angular/common';

import { StripeElementsOptions, StripeExpressCheckoutElementOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import {
  injectStripe,
  StripeElementsDirective,
  StripeExpressCheckoutComponent,
  StripePaymentElementComponent
} from 'ngx-stripe';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../service/api.service';

@Component({
    selector: 'app-checkout',
    imports: [
      NgOptimizedImage,
      FormsModule,
      ReactiveFormsModule,
      MidiImgComponent,
      MidiListComponent,
      PlayButtonComponent,
      RouterLink,
      StripeElementsDirective,
      StripePaymentElementComponent,
      StripeExpressCheckoutComponent
    ],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  // @ViewChild(StripeElementsDirective) elements!: StripeElementsDirective;
  // elements = viewChild(StripeElementsDirective);
  // @ViewChild(StripePaymentElementComponent) paymentElement!: StripePaymentElementComponent;
  public paymentElement = viewChild(StripePaymentElementComponent);

  private readonly fb = inject(UntypedFormBuilder);

  public app = inject(AppService);
  public api = inject(ApiService);
  public store = inject(StorageService);
  private payment = inject(PaymentService);

  public paymentElementForm = this.fb.group({
    email: ['your@email.com', [Validators.required]],
  });

  public elementsOptions: StripeElementsOptions = {
    locale: 'en',
    clientSecret: '',
    appearance: {
      theme: 'flat',
    },
  };

  options: StripeExpressCheckoutElementOptions = {
    buttonType: {
      applePay: 'buy',
      googlePay: 'buy',
      paypal: 'paypal',
    }
  };

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false
    }
  };

  public stripe = injectStripe(environment.stripe.key);
  paying = signal(false);

  constructor() {
    // @ts-ignore
    window['CheckoutComponent'] = this;
    if (this.store.cart.items().length === 0) {
      this.app.pageTitle.set('Cart Empty');
    }else{
      this.app.pageTitle.set('Cart');
    }
  }
  
  async ngOnInit() {
    const pi = await this.api.createPaymentIntent(this.store.cart.items().map(i => i.slug));
    this.elementsOptions.clientSecret = pi.client_secret as string;
  }

  // fetchUpdates() {
  //   this.elements()?.fetchUpdates();
  // }

  pay() {
    const paymentElement = this.paymentElement();
    if (!paymentElement) return;
    
    if (this.paying() || this.paymentElementForm.invalid) return;
    this.paying.set(true);

    const { email } = this.paymentElementForm.getRawValue();

    this.stripe
      .confirmPayment({
        elements: paymentElement.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              email: email as string,
            }
          }
        },
        redirect: 'if_required'
      })
      .subscribe(result => {
        this.paying.set(false);
        console.log('Result', result);
        if (result.error) {
          // Show error to your customer (e.g., insufficient funds)
          alert({ success: false, error: result.error.message });
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            // Show a success message to your customer
            alert({ success: true });
          }
        }
      });
  }

  public checkToggleItem(midi: MidiCartDto) {
    this.store.cart.items.update(items => {
      const item = items.find(i => i.slug === midi.slug);
      if (item) {
        item.checked = !item.checked;
      }
      return [...items];
    })
  }

  async checkout() {
    console.log('checkout', this.store.cart.items().filter(i => i.checked).map(i => i.slug))
    const result = await this.payment.createCheckoutSession(this.store.cart.items().filter(i => i.checked).map(i => i.slug));
    if (result.error) {
      console.error(result.error)
      return
    }
    console.log(result)
  }

}
