import { Component, ElementRef, HostListener, Input, WritableSignal, computed, inject, signal, viewChild } from '@angular/core';
import { MidiDto } from 'common';
import { AppService } from '../../service/app.service';
import { ApiService } from '../../service/api.service';
import { syncRun } from '../../utils/debounce';
import { MidiListComponent } from '../midi-list/midi-list.component';

@Component({
    selector: 'midi-list-latest',
    imports: [
        MidiListComponent
    ],
    templateUrl: './midi-list-latest.component.html',
    styleUrl: './midi-list-latest.component.scss'
})
export class MidiListLatestComponent {

  public app = inject(AppService);
  private api = inject(ApiService);

  public midiList = viewChild<MidiListComponent, ElementRef<HTMLDivElement>>(MidiListComponent, { read: ElementRef });

  public syncLoadItems = syncRun(async () => await this.loadItems());

  @Input()
  public items: WritableSignal<MidiDto[]> = signal([])
  public itemsUi = computed(() => this.items().filter(m => !this.filterOutItems().find(f => f.slug === m.slug)))

  @Input()
  public filterOutItems: WritableSignal<MidiDto[]> = signal([])

  @Input()
  private latestItemsPage: WritableSignal<number> = signal(0)


  @HostListener('document:scroll', ['$event'])
  public onScroll(event: Event) {
    const midiList = this.midiList();
    if (!midiList || !midiList.nativeElement) return;
    const midiListEl = midiList.nativeElement;
    const scrollTop = (event.target as Document).documentElement.scrollTop;
    if (midiListEl && scrollTop > midiListEl.offsetTop + midiListEl.scrollHeight - document.documentElement.clientHeight - 500) {
      this.syncLoadItems();
    }
  }

  async loadItems() {
    this.app.loading.set(true);
    const items = this.items();
    this.latestItemsPage.update(page => page + 1);
    const latest = await this.api.latestMidi(this.latestItemsPage(), 18);
    this.items.set([...items, ...latest]);
    this.app.loading.set(false);
  }
}