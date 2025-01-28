import { Component, ElementRef, PLATFORM_ID, inject, viewChild, effect } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap'
import { AppService } from '../../service/app.service';
import { SplatFogService } from '../../service/ui-fx/splat-fog.service';

const ANIM_DURATION = 0.2
const MOUSE_STOP_DELAY = 100
const ACTION_SELECTORS = ['[href]', 'button', 'input', 'textarea']
const DOT_SHOW_OPACITY = 0.5

@Component({
    selector: 'cursor',
    imports: [],
    templateUrl: './cursor.component.html',
    styleUrl: './cursor.component.scss'
})
export class CursorComponent {

  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private window = inject(DOCUMENT).defaultView!;

  private app = inject(AppService)

  public dot = viewChild<ElementRef<HTMLDivElement>>('dot');

  constructor() {
    if (this.isPlatformBrowser && !this.app.isMobile) {
      this.initEvents()
      effect(() => {
        if(this.dot()) {
          this.initDot()
        }
      })
    }
  }

  private initDot() {
    const dot = this.dot()!.nativeElement
    this.window.document.body.style.cursor = 'none'
    let midX = this.window.innerWidth / 2
    let midY = this.window.innerHeight / 2
    gsap.set(dot, {
      x: midX - this.window.scrollX - dot.clientWidth / 2,
      y: midY - this.window.scrollY - dot.clientHeight / 2,
      opacity: 0
    })
    this.updateDotUiNormal()
  }

  private initEvents() {
    this.app.pointerEvents.mouseenter.subscribe(e => this.onMouseEnter(e))
    this.app.pointerEvents.mouseover.subscribe(e => this.onMouseEnter(e))
    this.app.pointerEvents.mousemove.subscribe(e => this.onMouseMove(e))
    this.app.pointerEvents.mousemovestop.subscribe(e => this.onMouseMoveStop())
    this.app.pointerEvents.mouseleave.subscribe(e => this.onMouseLeave(e))
    this.app.pointerEvents.mouseout.subscribe(e => this.onMouseLeave(e))
    this.app.pointerEvents.touchmove.subscribe(e => this.onTouchMove(e))
    this.app.pointerEvents.touchcancel.subscribe(e => this.onTouchCancel(e))
    this.app.pointerEvents.touchend.subscribe(e => this.onTouchCancel(e))
  }

  private onMouseEnter(e: MouseEvent) {
    this.show()
  }

  private onMouseMove(event: MouseEvent) {
    this.move(event)
  }

  private onMouseMoveStop() {
    this.moveStop()
  }

  private onMouseLeave(event: MouseEvent) {
    this.hide()
  }

  private onTouchMove(event: TouchEvent) {
    this.move(event.touches[0] || event.changedTouches[0])
  }

  private onTouchCancel(e: TouchEvent) {
    this.hide()
  }

  private move(e: MouseEvent | Touch) {
    const dot = this.dot()!.nativeElement
    dot.classList.add('moving')
    gsap.set(dot, {
      opacity: 1,
      x: e.pageX - this.window.scrollX - dot.clientWidth / 2,
      y: e.pageY - this.window.scrollY - dot.clientHeight / 2
    })
    this.updateDotUi(e)
  }

  private moveStop() {
    const dot = this.dot()!.nativeElement
    dot.classList.remove('moving')
    gsap.set(dot, {
      ease: 'ease',
      duration: ANIM_DURATION,
      opacity: DOT_SHOW_OPACITY
    })
  }

  private show() {
    const dot = this.dot()!.nativeElement
    dot.classList.remove('hide')
  }

  private hide() {
    const dot = this.dot()!.nativeElement
    dot.classList.add('hide')
  }

  private updateDotUi(e: MouseEvent | Touch) {
    const action = Boolean((e.target as HTMLElement).closest(ACTION_SELECTORS.join(',')))
    if (action) {
      this.updateDotUiAction()
    } else {
      this.updateDotUiNormal()
    }
  }
  
  private updateDotUiAction() {
    const dot = this.dot()!.nativeElement
    dot.classList.add('action')
    gsap.to(dot, {
      ease: 'ease',
      duration: ANIM_DURATION,
      width: '50px',
      height: '50px'
    })
  }

  private updateDotUiNormal() {
    const dot = this.dot()!.nativeElement
    dot.classList.remove('action')
    gsap.to(dot, {
      ease: 'ease',
      duration: ANIM_DURATION,
      width: '20px',
      height: '20px'
    })
  }

}
