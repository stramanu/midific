import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { MidiModule } from './module/midi/midi.module';
import { EmailModule } from './module/email/email.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import configuration from './config/configuration';
import { PaymentModule } from './module/payment/payment.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   load: [configuration],
    // }),
    PaymentModule,
    MidiModule,
    EmailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
