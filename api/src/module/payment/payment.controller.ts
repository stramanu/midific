import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { MidiService } from '../midi/midi.service';

@Controller('payment')
export class PaymentController {

  constructor(
    private readonly paymentService: PaymentService,
    private readonly midiService: MidiService
  ) { }

  @Post('checkout-session-create')
  async createCheckoutSession(@Body() data: { slugs: string[] }, @Res() res: Response) {
    try {
      const midiItems = await this.midiService.getMidiItemsBySlugs(data.slugs);
      const session = await this.paymentService.createStripeSession(midiItems.map(midi => ({
        name: midi.name,
        amount: Math.round(midi.price * 100) // Stripe expects the amount in cents (e.g., 1000 = $10.00)
      })))
      console.log('session', session)
      res.send(session);
    } catch (err) {
      console.log('stripe error', err);
      res.status(500).send({ error: err.message });
    }
  }

  @Post('intent-create')
  async createPaymentIntent(@Body() data: { midiSlugs: string[] }) {
    try {
      const midiItems = await this.midiService.getMidiItemsBySlugs(data.midiSlugs);
      const intent = await this.paymentService.createPaymentIntent(midiItems.map(midi => ({
        name: midi.name,
        amount: Math.round(midi.price * 100) // Stripe expects the amount in cents (e.g., 1000 = $10.00)
      })))
      return intent;
    } catch (err) {
      console.log('stripe error', err);
      return { error: err.message };
    }
  }

}
