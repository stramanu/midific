import { Component, ElementRef, Input, PLATFORM_ID, WritableSignal, computed, effect, inject, isSignal, linkedSignal, signal, viewChild } from '@angular/core';
import { MidiDto } from 'common';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../service/api.service';

// const COLORS = [
//   '#f0adb0',
//   '#f5c2ab',
//   '#fae0ad',
//   '#c6d7b2',
//   '#c4def0'
// ]
const COLORS = [
  "#A8C9E6",
  "#F1D0A2",
  "#A0C4A8",
  "#F1B6C1",
  "#c4def0"
];

@Component({
  selector: 'midi-img',
  templateUrl: './midi-img.component.html',
  styleUrl: './midi-img.component.scss'
})
export class MidiImgComponent {

  // static TXT_CANVAS: HTMLCanvasElement | Canvas = null!
  // static TXT_CANVAS_READY = new Semaphore(true);

  public isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  public document = inject(DOCUMENT);
  private window = this.document.defaultView!;

  private api = inject(ApiService);

  private el: ElementRef<HTMLDivElement> = inject(ElementRef);
  public loaded = true;

  public imgMidiName = computed(() => {
    const midi = this.midi();
    if (!midi) return '';
    let minLength = 20;
    let angleDegrees = 20;
    if (this.isPlatformBrowser) {
      let w = this.el.nativeElement.clientWidth || 200;
      let h = Math.ceil(w * Math.tan(angleDegrees * Math.PI / 180));
      let hypotenuse = Math.ceil(Math.sqrt(w * w + h * h));
      minLength = hypotenuse / 10;
    }
    if (midi.name.length < minLength) {
      return (midi.name + " ").repeat(Math.ceil(minLength / (midi.name.length + 1))).trim();
    } else {
      return midi.name;
    }
  });

  @Input()
  priority = false;

  private _midi = signal<MidiDto | null>(null);

  @Input()
  public set midi(midi: (MidiDto | null) | WritableSignal<MidiDto | null>) {
    if (isSignal(midi)) {
      this._midi = midi;
    } else {
      this._midi.set(midi);
    }
  }
  public get midi(): WritableSignal<MidiDto | null> {
    return this._midi;
  }

  public patternId = computed(() => {
    const midi = this.midi();
    if (!midi) return null;
    return 'midimg-' + midi.id;
  });

  public backgroundColor = computed(() => {
    const midi = this.midi();
    if (!midi) return null;
    return COLORS[this.hashCode(this.midi()!.slug.toUpperCase()) % COLORS.length]
  });

  onLoad() {
    this.loaded = true
  }

  onError() {

  }

  hashCode(str: string) {
    let hash = 0,
      i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash);
  }

}