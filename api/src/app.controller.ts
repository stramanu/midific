import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppDataSource, AppDataSourceInit } from './data-source';
import fs from 'fs'
import { Midi } from './module/midi/midi.entity';

@Controller()
export class AppController {

  constructor(private readonly appService: AppService) {
    // to initialize the initial connection with the database, register all entities
    // and "synchronize" database schema, call "initialize()" method of a newly created database
    // once in your application bootstrap
    
    AppDataSourceInit()

  }
  
}
