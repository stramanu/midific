import { Component, ElementRef, Input, OnInit, PLATFORM_ID, effect, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { MidiDto } from 'common';
import { environment } from '../../../environments/environment';
import { DOCUMENT, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
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
export class MidiImgComponent implements OnInit {

  // static TXT_CANVAS: HTMLCanvasElement | Canvas = null!
  // static TXT_CANVAS_READY = new Semaphore(true);

  public isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  public document = inject(DOCUMENT);
  private window = this.document.defaultView!;

  private api = inject(ApiService);

  private el: ElementRef<HTMLDivElement> = inject(ElementRef);
  private _midi: MidiDto|null = null;
  public loaded = true;

  public imgMidiName = signal<string>('');
  
  // public svg = viewChild<ElementRef<SVGElement>>('svg');
  // public bgImg = viewChild<ElementRef<HTMLDivElement>>('bgImg');
  
  @Input() 
  priority = false;

  @Input() 
  set midi(midi: MidiDto|null) { 
    this._midi = midi;
    if(!midi) {
      this.imgMidiName.set('');
      return;
    }
    if(midi.name.length < 20) {
      this.imgMidiName.set((midi.name + " ").repeat(Math.ceil(20 / (midi.name.length + 1))).trim());
    }else{
      this.imgMidiName.set(midi.name);
    }
  }
  get midi() { 
    if(!this._midi) return null
    return this._midi;
  }

  get patternId() { 
    if(!this._midi) return null
    return 'midimg-'+this._midi.id;
  }
  
  // public get image() {
  //   if (!this._midi || !this.isPlatformBrowser) return '';
  //   const sizes = {
  //     x: 410,
  //     y: 410
  //   }
  //   if(this.isPlatformBrowser) {
  //     // multiply by device pixel ratio
  //     sizes.x = Math.round(this.el.nativeElement.clientWidth) * this.window.devicePixelRatio
  //     sizes.y = Math.round(this.el.nativeElement.clientHeight) * this.window.devicePixelRatio
  //   }
  //   return this.api.getMidiImage(this._midi, sizes)
  // }

  // private createCanvas!: (width?: number, height?: number) => HTMLCanvasElement | Canvas;

  async ngOnInit() {
    // if (this.isPlatformBrowser) {
    //   MidiImgComponent.TXT_CANVAS = this.document.createElement('canvas');
    // } else {
    //   // MidiImgComponent.TXT_CANVAS = createCanvas(50,50);
    //   let CANVAS = await import('canvas')
    //   MidiImgComponent.TXT_CANVAS = CANVAS.createCanvas(100,100);
    // }
    // MidiImgComponent.TXT_CANVAS_READY.notify();
    const bgColor = COLORS[this.hashCode(this._midi!.name.toUpperCase().repeat(10)) % COLORS.length]
    this.el.nativeElement.style.backgroundColor = bgColor;
  }

  // private async calcTextMeasure(text: string, options: { font: string, fontSize: number }) {
  //     await MidiImgComponent.TXT_CANVAS_READY.wait();
  //     // re-use canvas object for better performance
  //     const context = MidiImgComponent.TXT_CANVAS.getContext("2d");
  //     // @ts-ignore
  //     context.font = options.fontSize + 'px ' + options.font;
  //     // @ts-ignore
  //     const metrics = context.measureText(text);
  //     const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  //     const fontEm = metrics.emHeightAscent + metrics.emHeightDescent;
  //     const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  //     const estFontHeight = Math.ceil((fontHeight || fontEm || actualHeight) / 10) * 10

  //     return {
  //       width: Math.round(metrics.width),
  //       height: estFontHeight
  //     }
  //   }

  // private initEffect = effect(async () => {
  //   if(!this.midi) return;
  //   let el = this.el.nativeElement;
  //   if(!el) return;
  //   let bgImg = this.bgImg()?.nativeElement;
  //   if(!bgImg) return;

  //   // V2
  //   // let textMetrics = await this.calcTextMeasure(this.midi.name, { font: 'Arial Black', fontSize: 10 })
  //   // // console.log('textMetrics', this.midi.name, textMetrics)
  //   // //  width="${textMetrics.width}" height="${textMetrics.height}" viewBox="0 0 ${textMetrics.width} ${textMetrics.height}"
  //   // let svg = `
  //   //   <svg xmlns="http://www.w3.org/2000/svg">
  //   //       <text dominant-baseline="hanging" x="0" y="0" style="fill: rgb(255, 255, 255); font-family: Arial Black; font-size: 20px;">
  //   //           ${this.midi.name}
  //   //       </text>
  //   //   </svg>`
  //   // bgImg.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(svg)}")`;
  //   // bgImg.style.backgroundSize = `${textMetrics.width}px ${textMetrics.height}px`;
  //   // // bgImg.style.backgroundImage = `url("data:image/svg+xml;utf8,${svg.outerHTML}")`;
  //   // let sizes = this.calculateBoundingDimensions(el.clientWidth || 200, el.clientHeight || 200, 20);
  //   // bgImg.style.width = sizes.width+'px';
  //   // bgImg.style.height = sizes.height+'px'; 

  //   // V3
  //   // let svg = `
  //   //   <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1">
  //   //       <defs>
  //   //           <pattern id="basicPattern" height="20" width="100%" patternUnits="userSpaceOnUse">
  //   //               <text x="0" y="0" fill="#ffffff" font-family="Arial Black" font-size="20" alignment-baseline="hanging">
  //   //                   ${this.midi.name}
  //   //               </text>
  //   //           </pattern>
  //   //       </defs>
  //   //       <rect width="100%" height="100%" fill="url(#basicPattern)"></rect>
  //   //   </svg>`;

  //   setTimeout(() => {
  //     bgImg.classList.add('loaded')
  //   })
  // })

  // cleanup() {
  //   // this.initEffect.destroy();
  //   // this.svg()?.nativeElement.remove();
  // }

  onLoad(){
    this.loaded = true
  }

  onError(){
    
  }

  // calculateBoundingDimensions(w:number, h:number, angleDegrees: number) {
  //   // Converti l'angolo in radianti
  //   const angleRadians = (Math.PI / 180) * angleDegrees;

  //   // Calcola la larghezza e l'altezza del contenitore rotato
  //   const boundingWidth = 
  //       Math.abs(w * Math.cos(angleRadians)) + Math.abs(h * Math.sin(angleRadians));
  //   const boundingHeight = 
  //       Math.abs(w * Math.sin(angleRadians)) + Math.abs(h * Math.cos(angleRadians));

  //   return { width: Math.ceil(boundingWidth), height: Math.ceil(boundingHeight) };
  // }

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


