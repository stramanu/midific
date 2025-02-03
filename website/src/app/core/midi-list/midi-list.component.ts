import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Output, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { MidiDto } from 'common';
import { MidiItemComponent } from '../midi-item/midi-item.component';
import { RouterLink } from '@angular/router';
import { AppService } from '../../service/app.service';
import { ApiService } from '../../service/api.service';
import { syncRun } from '../../utils/debounce';

const FADE_FX_LATEST_ITEMS = 9
const FADE_FX_INIT_DELAY = 0.5

const RELATED_MIDI_LIMIT = 12
const USER_RELATED_MIDI_LIMIT = 6
const LATEST_MIDI_LIMIT = 18

@Component({
    selector: 'midi-list',
    imports: [
        MidiItemComponent,
        RouterLink
    ],
    templateUrl: './midi-list.component.html',
    styleUrl: './midi-list.component.scss'
})
export class MidiListComponent implements OnInit, OnDestroy {

  private static contexts: {
    [key: string]: MidiListComponent[]
  } = {
    default: []
  }

  public app = inject(AppService);
  private api = inject(ApiService);

  public itemsFadeInDelay: number[] = []

  public el = inject(ElementRef<HTMLDivElement>);

  public syncLoadItems = syncRun(async () => await this.loadItems());

  @Input()
  public items: WritableSignal<MidiDto[]> = signal([])
  
  public _items: WritableSignal<MidiDto[]> = signal([])
  public itemsUi = computed(() => this._items().filter(m => !this.filterOutItems().find(f => f.slug === m.slug)))

  @Output()
  public isEmpty = computed(() => this.itemsUi().length === 0)

  @Input()
  public loadItemsOfType: 'latest'|'related'|'user-related'|null = null

  @Input()
  public filterOutItems: WritableSignal<MidiDto[]> = signal([])

  @Input()
  public itemsPage: WritableSignal<number> = signal(0)

  @Input()
  public relatedMidiSlug = ''

  @Input()
  public hideIfEmpty = false

  @Input()
  public loadOnScroll = true

  @Input()
  public context = 'default'

  @Input()
  public exclude: (string|undefined)[] = []

  private get excludeSlugs() {
    let exclude = this.exclude.filter(e => e) as string[];
    const toIdx = MidiListComponent.contexts[this.context].indexOf(this) - 1;
    if (toIdx < 0) return exclude;
    return [...exclude, ...MidiListComponent.contexts[this.context].slice(0, toIdx).reduce((acc, c) => [...acc, ...c.items().map(i => i.slug)], [] as string[])]
  }

  constructor() {
    effect(() => {
      const itemsCount = this._items().length;
      this.el.nativeElement.style.display = this.hideIfEmpty && itemsCount === 0 ? 'none' : '';
      this.itemsFadeInDelay = Array(this._items().length).fill(0).map((_, i) => {
        const fill = itemsCount - FADE_FX_LATEST_ITEMS
        if (i >= fill) {
          let delay = ((i - fill) * 0.1)
          delay = delay * delay
          return FADE_FX_INIT_DELAY + Math.round(delay * 10000) / 10000
        }else{
          return 0
        }
      })
    })
  }

  ngOnInit() {
    if (!MidiListComponent.contexts[this.context]) {
      MidiListComponent.contexts[this.context] = []
    }
    MidiListComponent.contexts[this.context].push(this)
    if (this.items().length > 0) {
      this._items.set(this.items());
    }else if (this.loadItemsOfType != null && this.items().length === 0) {
      this.syncLoadItems();
    }
  }

  ngOnDestroy() {
    MidiListComponent.contexts[this.context] = MidiListComponent.contexts[this.context].filter(c => c !== this)
  }

  @HostListener('document:scroll', ['$event'])
  public onScroll(event: Event) {
    if (!this.el || !this.el.nativeElement || !this.loadOnScroll) return;
    if(this.loadItemsOfType == null || this.items().length > 0) return;
    const midiListEl = this.el.nativeElement;
    const scrollTop = (event.target as Document).documentElement.scrollTop;
    if (midiListEl && scrollTop > midiListEl.offsetTop + midiListEl.scrollHeight - document.documentElement.clientHeight - 500) {
      this.syncLoadItems();
    }
  }

  async loadItems() {
    this.app.loading.set(true);
    const items = this._items();
    this.itemsPage.update(page => page + 1);

    let newItems: MidiDto[] = [];

    switch (this.loadItemsOfType) {
      case 'related':
        newItems = await this.api.getRelatedMidi(this.relatedMidiSlug, 0, RELATED_MIDI_LIMIT, this.excludeSlugs);
        break;
      case 'user-related':
        newItems = await this.api.getUserRelatedMidi(this.itemsPage(), USER_RELATED_MIDI_LIMIT, this.excludeSlugs);
        break;
      case 'latest':
        newItems = await this.api.latestMidi(this.itemsPage(), LATEST_MIDI_LIMIT, this.excludeSlugs);
        break;
    }
    
    this._items.set([...items, ...newItems]);
    this.app.loading.set(false);
  }



}
