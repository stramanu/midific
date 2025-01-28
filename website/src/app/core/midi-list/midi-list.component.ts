import { Component, Input, Signal, effect } from '@angular/core';
import { MidiDto } from 'common';
import { MidiItemComponent } from '../midi-item/midi-item.component';
import { RouterLink } from '@angular/router';

const LATEST_ITEMS = 9
const INIT_DELAY = 0.5

@Component({
    selector: 'midi-list',
    imports: [
        MidiItemComponent,
        RouterLink
    ],
    templateUrl: './midi-list.component.html',
    styleUrl: './midi-list.component.scss'
})
export class MidiListComponent {

  @Input()
  public items!: Signal<MidiDto[]>
  public itemsFadeInDelay: number[] = []

  constructor() {
    effect(() => {
      this.itemsFadeInDelay = Array(this.items().length).fill(0).map((_, i) => {
        const fill = this.items().length - LATEST_ITEMS
        if (i >= fill) {
          let delay = ((i - fill) * 0.1)
          delay = delay * delay
          return INIT_DELAY + Math.round(delay * 10000) / 10000
        }else{
          return 0
        }
      })
    })
  }


}
