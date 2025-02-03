import { Component, ElementRef, Input, Signal, effect, inject, signal, viewChild } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MidiDto } from 'common';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { MidiImgComponent } from '../../core/midi-img/midi-img.component';
import { AppService } from '../../service/app.service';
import { MidiListComponent } from '../../core/midi-list/midi-list.component';
import { PlayerWidgetComponent } from '../../core/player-widget/player-widget.component';
import { MidiPlayerService } from '../../service/midi-player.service';

@Component({
    selector: 'app-midi',
    imports: [
      NgOptimizedImage,
        RouterLink,
        MidiImgComponent,
        MidiListComponent,
        PlayerWidgetComponent
    ],
    templateUrl: './midi.component.html',
    styleUrl: './midi.component.scss'
})
export class MidiComponent {

  private api = inject(ApiService);
  public app = inject(AppService);
  private route = inject(ActivatedRoute);
  private midiPlayerService = inject(MidiPlayerService);

  private _midi = signal<MidiDto|null>(null);

  @Input()
  public set midi(midi: MidiDto|null) {
    this._midi.set(midi);
  }
  public get midi() {
    return this._midi();
  }

  // public relatedMidi = resource<MidiDto[], string>({
  //   request: () => this.route.snapshot.paramMap.get('slug') || '',
  //   loader: async ({ request, abortSignal }) => await this.api.getRelatedMidi(request, 0, 12, abortSignal),
  // });

  public audioContext = this.midiPlayerService.audioContext

  constructor() {
    effect(() => {
      if (this._midi() != null) {
        this.app.pageTitle.set('');
      }else{
        this.app.pageTitle.set('MIDI Not Found');
      }
    });
  }

}
