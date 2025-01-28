import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MidiService } from '../midi/midi.service';

@Module({
  providers: [
    PaymentService,
    MidiService,
  ],
  controllers: [PaymentController]
})
export class PaymentModule {}
