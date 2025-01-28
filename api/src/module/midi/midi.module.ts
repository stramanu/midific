import { Module } from '@nestjs/common';
import { MidiService } from './midi.service';
import { MidiController } from './midi.controller';

@Module({
  providers: [MidiService],
  controllers: [MidiController]
})
export class MidiModule {}
