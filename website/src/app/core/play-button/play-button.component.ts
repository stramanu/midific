import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { MidiDto } from 'common';
import { MidiPlayerService } from '../../service/midi-player.service';
import { NgIf } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';

@Component({
    selector: 'play-button',
    imports: [
        LoaderComponent
    ],
    templateUrl: './play-button.component.html',
    styleUrl: './play-button.component.scss'
})
export class PlayButtonComponent {
  
  public midiPlayer = inject(MidiPlayerService);

  public get isPlaying(){
    return this.midiPlayer.isPlayingMidi(this.midi);
  }

  @Input()
  public midi!: MidiDto

  public isLoading = signal<boolean>(false);

  public async play(event: Event){
    event.stopPropagation();
    event.preventDefault();
    event.stopImmediatePropagation();
    if(this.isPlaying){
      this.midiPlayer.stop();
      return;
    }
    this.isLoading.set(true);
    await this.midiPlayer.play(this.midi);
    this.isLoading.set(false);    
  }

  public async pause(event: Event){
    event.stopPropagation();
    event.preventDefault();
    event.stopImmediatePropagation();
    this.midiPlayer.pause();
  }

}
