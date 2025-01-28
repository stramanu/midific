import { Component, Input, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MidiDto } from 'common';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { MidiImgComponent } from '../../core/midi-img/midi-img.component';
import { AppService } from '../../service/app.service';
import { MidiListComponent } from '../../core/midi-list/midi-list.component';
import { PlayerWidgetComponent } from '../../core/player-widget/player-widget.component';
import { MidiPlayerService } from '../../service/midi-player.service';
import { MidiListLatestComponent } from '../../core/midi-list-latest/midi-list-latest.component';

@Component({
    selector: 'app-midi',
    imports: [
      NgOptimizedImage,
        RouterLink,
        MidiImgComponent,
        MidiListComponent,
        MidiListLatestComponent,
        PlayerWidgetComponent
    ],
    templateUrl: './midi.component.html',
    styleUrl: './midi.component.scss'
})
export class MidiComponent implements OnInit {

  private api = inject(ApiService);
  public app = inject(AppService);
  private route = inject(ActivatedRoute);
  private midiPlayerService = inject(MidiPlayerService);

  private _midi: MidiDto|null = null;

  @Input()
  public set midi(midi: MidiDto|null) {
    this._midi = midi;
    this.updateRelatedMidi();
  }
  public get midi() {
    return this._midi;
  }

  @Input()
  public forYouMidiItems!: WritableSignal<MidiDto[]>
  
  public relatedMidi = signal<MidiDto[]>([]);

  public audioContext = this.midiPlayerService.audioContext

  async ngOnInit() {
    if (this._midi) {
      this.app.pageTitle.set('');
    }else{
      this.app.pageTitle.set('MIDI Not Found');
    }
  }

  private async updateRelatedMidi() {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.relatedMidi.set(await this.api.getRelatedMidi(slug, 0, 12));
  }

}
