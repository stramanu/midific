import { Component, ElementRef, Input, OnInit, PLATFORM_ID, inject, viewChild } from '@angular/core';
import { PlayButtonComponent } from "../play-button/play-button.component";
import { MidiDto } from 'common';
import { MidiPlayerService } from '../../service/midi-player.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'player-widget',
    imports: [PlayButtonComponent],
    templateUrl: './player-widget.component.html',
    styleUrl: './player-widget.component.scss'
})
export class PlayerWidgetComponent implements OnInit {

  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private window = inject(DOCUMENT).defaultView!;

  private midiPlayerService = inject(MidiPlayerService);

  public visualizer = viewChild<ElementRef<HTMLCanvasElement>>('visualizer')

  get canvas() {
    return this.visualizer()!.nativeElement;
  }

  @Input()
  public audioContext!: AudioContext

  @Input()
  public midi!: MidiDto

  private dataArray = new Uint8Array(this.isPlatformBrowser && this.midiPlayerService.analyser ? this.midiPlayerService.analyser.frequencyBinCount : 128);
  // private dataArray = new Uint8Array(128);
  

  ngOnInit() {
    if (this.isPlatformBrowser) {
      this.runLoop();
    }
  }
  

  runLoop() {
    requestAnimationFrame(() => {
      if (this.midiPlayerService.analyser) {
        this.midiPlayerService.analyser.getByteFrequencyData(this.dataArray);
        this.draw(this.normalizeData(this.filterData(this.dataArray)))
      }
      this.runLoop();
    });
  }

  /**
   * Filters the Uint8Array retrieved from an external source
   * @param {Uint8Array} audioBuffer the Uint8Array from drawAudio()
   * @returns {Array} an array of floating point numbers
   */
  filterData(audioBuffer: Uint8Array) {
    // remove zeros from beginning and end of array
    let start = 0
    let end = Math.floor(audioBuffer.length / 2)
    // let start = 0
    // let end = audioBuffer.length - 1
    // for (let i = 0; i < audioBuffer.length; i++) {
    //   if (audioBuffer[i] !== 0) {
    //     start = i;
    //     break;
    //   }
    // }
    // for (let i = audioBuffer.length - 1; i >= 0; i--) {
    //   if (audioBuffer[i] !== 0) {
    //     end = i;
    //     break;
    //   }
    // }
    let rawData = audioBuffer.slice(start, end);
    const samples = 60; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i; // the location of the first sample in the block
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
  };

  /**
   * Normalizes the audio data to make a cleaner illustration 
   * @param {Array} filteredData the data from filterData()
   * @returns {Array} an normalized array of floating point numbers
   */
  normalizeData(filteredData: number[]) {
      const max = Math.max(...filteredData);
      const min = Math.min(...filteredData);
      for (let i = 0; i < filteredData.length; i++) {
          filteredData[i] = (filteredData[i] - min) / (max - min);
      }
      return filteredData;
  }

  /**
   * Draws the audio file into a canvas element.
   * @param {Array} normalizedData The filtered array returned from filterData()
   * @returns {Array} a normalized array of data
   */
  draw(normalizedData: number[]) {
    // set up the canvas
    
    const dpr = (this.isPlatformBrowser ? this.window.devicePixelRatio : 1) || 1;
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = (this.canvas.offsetHeight) * dpr;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.translate(0, this.canvas.offsetHeight / 2); // set Y = 0 to be in the middle of the canvas

    // draw the line segments
    const width = this.canvas.offsetWidth / normalizedData.length;
    for (let i = 0; i < normalizedData.length; i++) {
      const x = width * i;
      let height = normalizedData[i] * (this.canvas.offsetHeight / 2) * 0.5;
      // if (height < 0) {
      //     height = 0;
      // } else if (height > this.canvas.offsetHeight / 2) {
      //     // the line segment is too tall
      //     // @ts-ignore
      //     height = height > this.canvas.offsetHeight / 2;
      //     // height = this.canvas.offsetHeight / 2;
      // }
      this.drawLineSegment(ctx, x, height, width, Boolean((i + 1) % 2));
    }
  };

  /**
   * A utility function for drawing our line segments
   * @param {AudioContext} ctx the audio context 
   * @param {number} x  the x coordinate of the beginning of the line segment
   * @param {number} height the desired height of the line segment
   * @param {number} width the desired width of the line segment
   * @param {boolean} isEven whether or not the segmented is even-numbered
   */
  drawLineSegment(ctx: CanvasRenderingContext2D, x: number, height: number, width: number, isEven: boolean) {
    ctx.lineWidth = 1; // how thick the line is
    ctx.strokeStyle = "#fff"; // what color our line is
    ctx.beginPath();
    height = isEven ? height : -height;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.arc(x + width / 2, height, width / 2, Math.PI, 0, isEven);
    ctx.lineTo(x + width, 0);
    ctx.stroke();
  };

}
