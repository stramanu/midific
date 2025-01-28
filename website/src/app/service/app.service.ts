import { Inject, Injectable, Optional, PLATFORM_ID, REQUEST, effect, inject, signal } from '@angular/core';
import { MidiDto } from 'common';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from './storage.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import MobileDetect from 'mobile-detect';
import { Request } from 'express';
import { SplatFogService } from './ui-fx/splat-fog.service';

export interface ExtMouseEvent extends MouseEvent {
  latestPos: { x: number, y: number }
}

export interface ExtTouchEvent extends TouchEvent {
  latestPos: { x: number, y: number }[]
}

const POINTER_STOP_TIMEOUT = 100
@Injectable({
  providedIn: 'root'
})
export class AppService {

  public isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  public document = inject(DOCUMENT);
  private window = this.document.defaultView!;
  // private request = inject(REQUEST);

  private splatFogService = inject(SplatFogService);

  private store = inject(StorageService);
  public route = inject(ActivatedRoute);
  
  public pageTitle = signal<string>('');
  public loading = signal<boolean>(false);

  private userAgent = '' //this.isPlatformBrowser ? this.window.navigator.userAgent : this.request.headers.get('user-agent');
  public isMobile = false //this.userAgent ? new MobileDetect(this.userAgent).mobile() : false;
  
  constructor(
    @Optional() @Inject(REQUEST) private request: Request
  ) {
    (this.window as any).AppService = this;
    this.userAgent = this.isPlatformBrowser ? this.window.navigator.userAgent : this.request?.headers['user-agent'] || '';
    this.isMobile = this.userAgent ? Boolean(new MobileDetect(this.userAgent).mobile()) : false;

    this.updateTheme()
    if (this.isPlatformBrowser) {
      this.initPointerEvents();
      this.initWindowEvents();
    }
  }

  public pointerEvents = {
    mouseenter: new Subject<MouseEvent>(),
    mouseover: new Subject<MouseEvent>(),
    mousemove: new Subject<ExtMouseEvent>(),
    mousemovestop: new Subject(),
    mouseleave: new Subject<MouseEvent>(),
    mouseout: new Subject<MouseEvent>(),
    touchstart: new Subject<TouchEvent>(),
    touchmove: new Subject<ExtTouchEvent>(),
    touchmovestop: new Subject(),
    touchend: new Subject<TouchEvent>(),
    touchcancel: new Subject<TouchEvent>()
  }
  public pointerEventsExt = {
    mouseStopToId: null as any,
    touchStopToId: null as any
  }

  public windowEvents = {
    scroll: new Subject<Event>(),
    resize: new Subject<Event>()
  }

  private latestPos: {
    mousemove: { x: number, y: number } | null,
    touchmove: { x: number, y: number }[] | null
  } = {
    mousemove: null,
    touchmove: null
  }

  initPointerEvents() {
    this.document.addEventListener('mouseenter', e => this.pointerEvents.mouseenter.next(e), { passive: true })
    this.document.addEventListener('mouseover', e => this.pointerEvents.mouseover.next(e), { passive: true })
    this.document.addEventListener('mousemove', event => {
      const e = event as ExtMouseEvent
      e.latestPos = this.latestPos.mousemove != null ? this.latestPos.mousemove : { x: e.clientX, y: e.clientY }
      this.pointerEvents.mousemove.next(e)
      clearTimeout(this.pointerEventsExt.mouseStopToId)
      this.pointerEventsExt.mouseStopToId = setTimeout(() => this.pointerEvents.mousemovestop.next(e), POINTER_STOP_TIMEOUT)
      this.latestPos.mousemove = { x: e.clientX, y: e.clientY }
    }, { passive: true })
    this.document.addEventListener('mouseleave', e => this.pointerEvents.mouseleave.next(e), { passive: true })
    this.document.addEventListener('mouseout', e => this.pointerEvents.mouseout.next(e), { passive: true })
    this.document.addEventListener('touchstart', e => this.pointerEvents.touchstart.next(e), { passive: true })
    this.document.addEventListener('touchmove', event => {
      const e = event as ExtTouchEvent
      e.latestPos = this.latestPos.touchmove != null ? this.latestPos.touchmove : Array.from(e.targetTouches).map(t => ({ x: t.clientX, y: t.clientY }))
      this.pointerEvents.touchmove.next(e)
      clearTimeout(this.pointerEventsExt.touchStopToId)
      this.pointerEventsExt.touchStopToId = setTimeout(() => this.pointerEvents.touchmovestop.next(e), POINTER_STOP_TIMEOUT)
      this.latestPos.touchmove = Array.from(e.targetTouches).map(t => ({ x: t.clientX, y: t.clientY }))
    }, { passive: true })
    this.document.addEventListener('touchend', e => this.pointerEvents.touchend.next(e), { passive: true })
    this.document.addEventListener('touchcancel', e => this.pointerEvents.touchcancel.next(e), { passive: true })
  }

  initWindowEvents() {
    this.window.addEventListener('scroll', e => this.windowEvents.scroll.next(e), { passive: true })
    this.window.addEventListener('resize', e => this.windowEvents.resize.next(e), { passive: true })
  }

  // Cart methods

  isInCart(item: MidiDto) {
    return this.store.cart.items().find(i => i.id == item.id)
  }
  
  addToCart(item: MidiDto, event: MouseEvent){
    if (this.isInCart(item)) return; 
    this.store.cart.items.update(items => [...items, {
      ...item,
      checked: true
    }]);

    const minicart = this.document.querySelector('minicart')
    if (event && minicart) {
      const minicartRect = minicart.getBoundingClientRect()
      this.splatFogService.fromTo({
        x: event.clientX,
        y: event.clientY
      }, {
        x: minicartRect.x + minicartRect.width / 2,
        y: minicartRect.y + minicartRect.height / 2
      })
    }
  }

  removeFromCart(item: MidiDto){
    this.store.cart.items.update(items => items.filter(i => i !== item));
  }

  getCart(){
    return this.store.cart.items();
  }

  updateTheme() {
    const theme = this.store.theme();
    this.document.body.setAttribute('data-theme', theme);
  }

  getTheme() {
    return this.store.theme();
  }

  toggleTheme() {
    this.store.theme.update(theme => theme === 'dark' ? 'light' : 'dark');
    this.updateTheme();
    return this.store.theme();
  }
  
}
