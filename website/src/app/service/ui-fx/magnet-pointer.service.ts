import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import { gsap } from 'gsap';
import { AppService } from '../app.service';

interface Point {
  x: number;
  y: number;
}

// const MAGNETIC_FORCE = 1000
const MAGNETIC_FORCE = 500

@Injectable({
  providedIn: 'root'
})
export class MagnetPointerService {

  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private document = inject(DOCUMENT);
  private window = this.document.defaultView!;

  private app = inject(AppService);

  private itemSelectors: string[] = [];
  private pointerPos: Point = { x: 0, y: 0 };
  private animationFrameId = -1;
  private run = false;

  private get items() {
    return Array.from(document.querySelectorAll(this.itemSelectors.join(','))) as HTMLElement[];
  }

  constructor() {
    if (this.isPlatformBrowser && !this.app.isMobile) {
      this.init();
    }
  }

  init() {
    this.app.pointerEvents.mouseleave.subscribe(e => this.onMouseLeave(e));
    this.app.pointerEvents.mousemove.subscribe(e => this.onMouseMove(e));
    this.app.windowEvents.scroll.subscribe(e => this.onScrolOrResize());
    this.app.windowEvents.resize.subscribe(e => this.onScrolOrResize());
  }

  addItemSelectors(itemSelectors: string[]) {
    this.itemSelectors = this.itemSelectors.concat(itemSelectors);
  }

  removeItemSelectors(itemSelectors: string[]) {
    this.itemSelectors = this.itemSelectors.filter(selector => !itemSelectors.includes(selector));
  }

  start() {
    this.run = true;
  }

  stop() {
    this.run = false;
    this.resetUi();
  }

  private onMouseLeave(e: MouseEvent) {
    if (!this.run) return;
    this.resetUi();
  }

  private onMouseMove(e: MouseEvent) {
    
    if (!this.run) return;
    this.pointerPos = { x: e.clientX, y: e.clientY };
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => this.updateUi({ 
      x: this.pointerPos.x + this.window.scrollX, 
      y: this.pointerPos.y + this.window.scrollY 
    }));
    
  }

  private onScrolOrResize() {
    
    if (!this.run) return;
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => this.updateUi({ 
      x: this.pointerPos.x + this.window.scrollX, 
      y: this.pointerPos.y + this.window.scrollY 
    }));
    
  }

  private isElementInViewport(rect: DOMRect, offset = 0) {
    
    // return (
    //     rect.top >= 0 &&
    //     rect.left >= 0 &&
    //     rect.bottom <= (this.window.innerHeight || this.document.documentElement.clientHeight) && 
    //     rect.right <= (this.window.innerWidth || this.document.documentElement.clientWidth) 
    // );
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <= (this.window.innerHeight || this.document.documentElement.clientHeight) + offset && 
      rect.right <= (this.window.innerWidth || this.document.documentElement.clientWidth) + offset 
    );
    
  }

  private updateUi(pointerPos: Point) {
    
    for (let item of this.items) {

      const rect = item.getBoundingClientRect();

      if (!this.isElementInViewport(rect, 100)) continue;

      let itemPos = {
        x: this.window.scrollX + rect.x + (rect.width / 2),
        y: this.window.scrollY + rect.y + (rect.height / 2)
      };

      let dist = this.distance(pointerPos, itemPos);
      if (dist === 0) continue; // Salta se le posizioni coincidono

      let itemForce = item.getAttribute('magnetic-force');

      let force = itemForce ? parseFloat(itemForce) : MAGNETIC_FORCE;
      let attraction = Math.max(Math.min(force / (dist * dist), 0.15), 0);
      
      let dx = (pointerPos.x - itemPos.x) * attraction;
      let dy = (pointerPos.y - itemPos.y) * attraction;

      gsap.to(item, {
        x: dx,
        y: dy,
        duration: 0.6,
        ease: "power1.out"
      });
    }
    
  }

  private resetUi() {
    for (let item of this.items) {
      gsap.to(item, { 
        x: 0, 
        y: 0,
        duration: 1,
        ease: "power2.out"
      });
    }
  }

  private distance(p1: Point, p2: Point) {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

}
