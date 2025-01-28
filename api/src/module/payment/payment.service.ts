import { Injectable } from '@nestjs/common';
import {CONFIG} from '../../config/configuration';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {

    private stripe = new Stripe(CONFIG().stripe.secret_key)

    /**
     * Create a Stripe session for a one-time payment
     * @param amount Amount in cents (e.g., 1000 = $10.00)
     * @returns 
     */
    async createStripeSession(items: { name: string, amount: number }[]) {
        return await this.stripe.checkout.sessions.create({
            line_items: items.map(item => ({
              price_data: {
                currency: 'eur',
                product_data: {
                  name: item.name,
                  tax_code: 'txcd_10401100' // Opere audio digitali - download - senza abbonamento - con diritti permanenti	
                },
                unit_amount: item.amount, // Stripe expects the amount in cents (e.g., 1000 = $10.00)
              },
              quantity: 1,
            })),
            mode: 'payment', // This session is for a one-time payment
            success_url: `${CONFIG().website.url}/thank-you?hash=hash`, // TODO create cart hash
            cancel_url: `${CONFIG().website.url}/canceled-payment?hash=hash`,
            expand: ['payment_intent']
        });
    }

    /**
     * Create a Stripe payment intent
     * @param amount Amount in cents (e.g., 1000 = $10.00)
     * @returns 
     */
    async createPaymentIntent(items: { name: string, amount: number }[]) {
        return await this.stripe.paymentIntents.create({
            amount: items.reduce((acc, item) => acc + item.amount, 0),
            currency: 'eur',
            description: 'Midi files',
            // all method types
            payment_method_types: [
              'card',
              // 'ideal',
              // 'sepa_debit',
              // 'sofort',
              // 'bancontact',
              // 'giropay',
              // 'p24',
              // 'eps',
              // 'alipay',
              // 'wechat'
            ],
            metadata: {
                items: JSON.stringify(items)
            }
        });
      }

}
