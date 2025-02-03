import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Inject, OnInit, Optional, PLATFORM_ID, REQUEST, effect, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { AppService } from './service/app.service';
import { LoaderComponent } from './core/loader/loader.component';
import { MidiPlayerService } from './service/midi-player.service';
import { MagnetPointerService } from './service/ui-fx/magnet-pointer.service';
import { CursorComponent } from './core/cursor/cursor.component';
import { SplatFogService } from './service/ui-fx/splat-fog.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TransitionService } from './service/transition.service';
import { CheckoutComponent } from './page/checkout/checkout.component';

@Component({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    selector: 'app-root',
    imports: [
        RouterOutlet,
        CursorComponent,
        HeaderComponent,
        FooterComponent,
        LoaderComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  public app = inject(AppService);
  public transitionService = inject(TransitionService);
  private midiPlayerService = inject(MidiPlayerService);
  private magnetPointerService = inject(MagnetPointerService);
  private splatFogService = inject(SplatFogService)
  private document = inject(DOCUMENT);
  private window = this.document.defaultView;

  public canvasfx = viewChild<ElementRef<HTMLCanvasElement>>('canvasfx');

  public get pageTitle() {
    return this.app.pageTitle();
  }

  public get loading() {
    return this.app.loading();
  }
  
  constructor(
    @Optional() @Inject(REQUEST) private request: Request
  ) {
    // console.log('APP COMPO request', this.request);
    if (!this.isPlatformBrowser) return;
    effect(() => {
      const canvasfx = this.canvasfx()
      if (canvasfx) {
        this.splatFogService.init(canvasfx.nativeElement)
      }
    })
    effect(() => {
      const transitionInfo = this.transitionService.currentTransition();
      switch (transitionInfo?.to.firstChild?.component) {
        case CheckoutComponent:
          this.document.body.setAttribute('data-transition', 'to-checkout');
          break;
        default:
          this.document.body.setAttribute('data-transition', 'to-other');
          break;
      }
    })
  }

  ngOnInit(): void {
    this.magnetPointerService.addItemSelectors([
      '.magnetic'
    ]);
    this.magnetPointerService.start();
    this.app.pointerEvents.mousemove.subscribe(e => {
      this.splatFogService.fromTo({
        x: e.latestPos.x,
        y: e.latestPos.y
      }, {
        x: e.clientX,
        y: e.clientY,
      }, 0.2)
    })
    this.app.pointerEvents.touchmove.subscribe(e => {
      this.splatFogService.fromTo({
        x: e.latestPos[0].x,
        y: e.latestPos[0].y
      }, {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }, 0.2)
    })
  }



}
