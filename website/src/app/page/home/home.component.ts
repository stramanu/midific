import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, HostListener, Input, OnInit, ViewChild, WritableSignal, computed, inject, signal } from '@angular/core';
import { MidiDto } from 'common';
import { AppService } from '../../service/app.service';
import { ApiService } from '../../service/api.service';
import { MidiListLatestComponent } from '../../core/midi-list-latest/midi-list-latest.component';
import { MidiListComponent } from '../../core/midi-list/midi-list.component';

@Component({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    selector: 'app-home',
    imports: [
        MidiListComponent,
        MidiListLatestComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  public app = inject(AppService);

  @Input()
  public latestMidiItems!: WritableSignal<MidiDto[]>

  @Input()
  public forYouMidiItems!: WritableSignal<MidiDto[]>

  async ngOnInit() {
    this.app.pageTitle.set('');
  }

}
