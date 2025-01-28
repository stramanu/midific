import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import MidiPlayerInterface from 'midi-player-js';
import * as SoundfontInterface from 'soundfont-player';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { MidiDto, Crypto } from 'common';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MidiPlayerService {

  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private window = inject(DOCUMENT).defaultView!;

  private api = inject(ApiService)


  private player: MidiPlayerInterface.Player|null = null;

  private instruments: {
    [name:string]: SoundfontInterface.Player
  } = {}
  
  private currentMidi: MidiDto | null = null;

  public analyser!: AnalyserNode;
  
  public audioContext!: AudioContext;
  public instrumentNode!: AudioNode;

  public currentMidiTracks: {
    [track: number]: string,
  } = {}

  constructor() {
    console.log('');
    // if (this.isPlatformBrowser) {
    //   this.init();
    // }
  }

  // TODO
  private async fetchPianoSf2() {
    const sf2Data = await fetch('/piano.sf2');
    const arrayBuffer = await sf2Data.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const SoundFont2 = (await import('soundfont2')).default.SoundFont2;
    (this.window as any).SoundFont2 = SoundFont2;
    return new SoundFont2(data);
  }

  private async init() {
    if (this.audioContext) return
    
    this.audioContext = new (this.window.AudioContext || (this.window as any).webkitAudioContext)();
    this.instrumentNode = this.audioContext.createGain();

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.player = new MidiPlayerInterface.Player();

    this.instruments = {
      keyboard: await SoundfontInterface.instrument(this.audioContext, '/soundfonts/acoustic_grand_piano-mp3.js' as SoundfontInterface.InstrumentName, {
        // soundfont: await this.fetchPianoSf2()
        destination: this.instrumentNode
      }),
      // bass: await SoundfontInterface.instrument(this.audioContext, 'acoustic_bass', {
      //   destination: this.instrumentNode
      // }),
      // guitar: await SoundfontInterface.instrument(this.audioContext, 'acoustic_guitar_nylon', {
      //   destination: this.instrumentNode
      // }),
      // strings: await SoundfontInterface.instrument(this.audioContext, 'string_ensemble_1', {
      //   destination: this.instrumentNode
      // }),
      // brass: await SoundfontInterface.instrument(this.audioContext, 'trumpet', {
      //   destination: this.instrumentNode
      // }),
      // woodwinds: await SoundfontInterface.instrument(this.audioContext, 'clarinet', {
      //   destination: this.instrumentNode
      // }),
      "drum track": await SoundfontInterface.instrument(this.audioContext, '/soundfonts/synth_drum-mp3.js' as SoundfontInterface.InstrumentName, {
        destination: this.instrumentNode
      }),
      // harmonica: await SoundfontInterface.instrument(this.audioContext, 'harmonica', {
      //   destination: this.instrumentNode
      // }),
    }

    this.instrumentNode.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)

    this.player.on('fileLoaded', () => {
      // Do something when file is loaded
      this.currentMidiTracks = {}
      if (this.player?.tracks) {
        for (const track of this.player?.tracks) {
          let info = track.events.find(event => event.name === 'Sequence/Track Name');
          if (info && info.string){
            this.currentMidiTracks[info.track] = info.string.trim()
          }
        }
      }else{
        console.error('No tracks found');
      }
    });

    // this.player.on('playing', (currentTick:any) => {
    //   console.log('current tick', currentTick);
    // });

    this.player.on('midiEvent', (event: MidiPlayerInterface.Event) => {
      
      if (event.name === 'Note on') {
        let instrument = this.instruments['keyboard']
        if (event.channel == 10) {
          instrument = this.instruments['drum track']
        }
        instrument.play(String(event.noteNumber), this.audioContext.currentTime, {
          gain: ((event.velocity! + 1) / 128) + 0.5
        });
      }
      // if (event.name === 'Note off' || event.velocity === 0) {
      //   this.instrument.stop(event.noteNumber!);
      // }
      
    });

    this.player.on('endOfFile', () => {
      // Do something when end of the file has been reached.
      // console.log('end of file');
    });
  }

  async loadFile(fileUrl: string) {
    try {
      const response = await fetch(fileUrl)
      const buffer = await response.arrayBuffer()
      const data = new Uint8Array(buffer)
      this.player?.loadArrayBuffer(data)
    } catch (error) {
      console.error('Error loading file', error)
      throw error
    }
  }

  private async loadMidi(midi: MidiDto) {
    const file = await this.api.getMidiFile(midi.slug)
    if (!file) {
      throw new Error('No file found')
    }
    this.player?.loadArrayBuffer(Crypto.decryptFile(file, environment.midi.enc_key))
  }

  async play(midi: MidiDto) {
    this.init();
    this.stop();
    this.currentMidi = midi;
    try {
      await this.loadMidi(midi);
      this.player?.play();
    } catch (error) {
      console.error('Error loading file', error)
    }
  }

  pause() {
    this.player?.pause();
  }

  stop() {
    this.player?.stop();
  }

  get tempo() {
    return this.player?.tempo;
  }

  get format() {
    return this.player?.format;
  }

  get songPercentRemaining() {
    return this.player?.getSongPercentRemaining();
  }

  get currentTick() {
    return this.player?.getCurrentTick();
  }

  get songTime() {
    return this.player?.getSongTime();
  }

  get songTimeRemaining() {
    return this.player?.getSongTimeRemaining();
  }

  get isPlaying() {
    return this.player?.isPlaying();
  }

  isPlayingMidi(midi: MidiDto) {
    return this.isPlaying && this.currentMidi?.id === midi.id;
  }


}