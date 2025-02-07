import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Output, Signal, WritableSignal, computed, effect, inject, resource, signal } from '@angular/core';
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

  public itemsReload = syncRun(() => this.itemsUi.reload()) 

  @Input()
  public items: WritableSignal<MidiDto[]> = signal([])

  private prevItems: MidiDto[] = []
  
  public itemsUi = resource({
    loader: async ({ request, abortSignal }) => {
      // this.app.loading.set(true);
      const inputItems = this.items();
      if (inputItems.length > 0) {
        return inputItems;
      } else 
      if (this.loadItemsOfType != null) {
        let items: MidiDto[] = [];
        if(this.loadOnScroll) {
          items = this.prevItems;
          this.itemsPage.update(page => page + 1);
        }
        switch (this.loadItemsOfType) {
          case 'related':
            items = [...items, ...await this.api.getRelatedMidi(this.relatedMidiSlug, 0, RELATED_MIDI_LIMIT, this.excludeSlugs, abortSignal)];
            break;
          case 'user-related':
            items = [...items, ...await this.api.getUserRelatedMidi(this.itemsPage(), USER_RELATED_MIDI_LIMIT, this.excludeSlugs, abortSignal)];
            break;
          case 'latest':
            items = [...items, ...await this.api.latestMidi(this.itemsPage(), LATEST_MIDI_LIMIT, this.excludeSlugs, abortSignal)];
            break;
        }
        // this.app.loading.set(false);
        if(this.loadOnScroll) {
          this.prevItems = items;
        }
        return items
      } else {
        return this.prevItems = []
      }
    },
  });

  @Output()
  public isEmpty = computed(() => this.itemsUi.hasValue() && this.itemsUi.value()?.length === 0)

  @Input()
  public loadItemsOfType: 'latest'|'related'|'user-related'|null = null

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
  public exclude: (Signal<MidiDto|null>|undefined)[] = []

  private excludeSlugs: string[] = []

  constructor() {
    effect(() => {
      this.items();
      this.itemsReload();
    })
    effect(() => {
      const excludeSlugs = this.computeExcludeSlugs();
      if (JSON.stringify(excludeSlugs) === JSON.stringify(this.excludeSlugs)) return;
      this.excludeSlugs = excludeSlugs;
      this.itemsReload();
    })
    effect(() => {
      const itemsCount = this.itemsUi.value()?.length || 0;
      this.el.nativeElement.style.display = this.hideIfEmpty && itemsCount === 0 ? 'none' : '';
      this.itemsFadeInDelay = Array(itemsCount).fill(0).map((_, i) => {
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
    this.excludeSlugs = this.computeExcludeSlugs();
  }

  ngOnDestroy() {
    MidiListComponent.contexts[this.context] = MidiListComponent.contexts[this.context].filter(c => c !== this)
  }

  private computeExcludeSlugs() {
    const exclude = this.exclude.filter(e => !!e).map(e => e!()?.slug).filter(s => !!s) as string[];
    const toIdx = MidiListComponent.contexts[this.context].indexOf(this) - 1;
    if (toIdx < 0) {
      return exclude;
    }else{
      return [
        ...exclude,
        ...MidiListComponent.contexts[this.context].slice(0, toIdx).reduce((acc, c) => [...acc, ...c.items().map(i => i.slug)], [] as string[])
      ]
    }
  }

  @HostListener('document:scroll', ['$event'])
  public onScroll(event: Event) {
    if (!this.el || !this.el.nativeElement || !this.loadOnScroll) return;
    if(this.loadItemsOfType == null || this.items().length > 0) return;
    const midiListEl = this.el.nativeElement;
    const scrollTop = (event.target as Document).documentElement.scrollTop;
    if (midiListEl && scrollTop > midiListEl.offsetTop + midiListEl.scrollHeight - document.documentElement.clientHeight - 500) {
      this.itemsReload();
    }
  }

}
