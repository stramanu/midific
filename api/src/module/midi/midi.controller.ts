import { Body, Controller, Get, Param, ParseArrayPipe, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
import { MidiService } from './midi.service';
import { Response } from 'express';

@Controller('midi')
export class MidiController {
    
    constructor(
      private readonly midiService: MidiService
    ) {}
    
    @Get('user-related')
    async userRelatedMidi(@Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number, @Query('exclude') exclude: string) {
      return await this.midiService.userRelatedMidi(page, limit, JSON.parse(exclude));
    }

    @Get('latest')
    async latestMidi(@Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number, @Query('exclude') exclude: string) {
      return await this.midiService.latestMidi(page, limit, JSON.parse(exclude));
    }
    
    @Get(':slug/related')
    async getRelatedMidi(@Param('slug') slug: string, @Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number, @Query('exclude') exclude: string) {
      return await this.midiService.getRelatedMidi(slug, page, limit, JSON.parse(exclude));
    }
    
    @Get('search')
    async searchMidi(@Query('query') query: string, @Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number) {
      return await this.midiService.searchMidi(query, page, limit);
    }
    
    @Get(':slug')
    async getMidi(@Param('slug') slug: string) {
      return await this.midiService.getMidi(slug);
    }
    
    @Post('file')
    async getMidiFile(@Body() data: {slug: string}, @Res() response: Response) {
      response.type('application/octet-stream').send(await this.midiService.getMidiFile(data.slug));
    }
    
    @Get('image/:slug/:size.:format')
    async getMidiImage(@Param('slug') slug: string, @Param('size') size: string, @Param('format') format: string, @Res() response: Response) {
      const midi = await this.midiService.getMidi(slug); 
      if (!midi) return response.status(404).send('Not found');
      const [x, y] = size.split('x').map(s => parseInt(s));
      response.type(`image/${format}`);
      try {
        return (await this.midiService.getMidiImage(midi, {x, y, format})).pipe(response);
      } catch (error) {
        return response.status(500).send('Internal server error');
      }
    }
    
}
