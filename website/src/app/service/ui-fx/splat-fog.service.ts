import { Injectable, inject } from '@angular/core';
import * as SplatFogCanvas from './effects/splat-fog-canvas';
import { gsap } from 'gsap';

@Injectable({
  providedIn: 'root'
})
export class SplatFogService {
  

  move: (pos: { x: number, y: number }) => void = () => {
    console.warn('SplatFogService not initialized')
  }

  init(canvas: HTMLCanvasElement) {
    this.move = SplatFogCanvas.start(canvas).move
  }

  fromTo(point: { x: number, y: number }, to: { x: number, y: number }, duration = 0.4) {
    gsap.to(point, {
      x: to.x,
      y: to.y,
      duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        this.move(point)
      }
    })
  }
  
}
