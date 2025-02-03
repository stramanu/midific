import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, HostListener, Input, OnInit, ViewChild, WritableSignal, computed, inject, signal, viewChild } from '@angular/core';
import { MidiDto } from 'common';
import { AppService } from '../../service/app.service';
import { MidiListComponent } from '../../core/midi-list/midi-list.component';

@Component({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    selector: 'app-home',
    imports: [
        MidiListComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  public app = inject(AppService);

  public userRelatedMidiList = viewChild<MidiListComponent>('userRelatedMidiList');

  async ngOnInit() {
    this.app.pageTitle.set('');
  }

}
