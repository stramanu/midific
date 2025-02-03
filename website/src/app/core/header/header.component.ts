import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { MinicartComponent } from '../minicart/minicart.component';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule, DOCUMENT, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { AppService } from '../../service/app.service';
import { LottieComponent, AnimationOptions, LottieTransferState } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    selector: 'header',
    imports: [
      CommonModule,
      LottieComponent,
      NgOptimizedImage,
      RouterLink,
      SearchBoxComponent,
      MinicartComponent,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  private router = inject(Router);
  private app = inject(AppService);
  public isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private window = inject(DOCUMENT).defaultView!;
  private lottieTransferState = inject(LottieTransferState);

  private el = inject(ElementRef);

  private animationItem!: AnimationItem;
  public themeToggleLottieOptions!: AnimationOptions

  public logoOnly = false;


  ngOnInit() {
    // subscribe to route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRoute(event.url);
        // if (this.isPlatformBrowser) {
        //   // scroll to top smoothly
        //   this.window.scrollTo({ top: 0 });
        //   // window.scrollTo({ top: 0, behavior: 'smooth' });
        // }
      }
    })

    if (this.isPlatformBrowser) {
      this.themeToggleLottieOptions = {
        // path: '/icons/anim-theme-toggle.json',
        animationData: this.lottieTransferState.get('anim-theme-toggle.json'),
        loop: false,
        autoplay: false
      };
    }
  }

  // aggiungi classe "shadow" all'elemento el.nativeElement quando lo scroll è maggiore di 10
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isPlatformBrowser) {
      if (this.window.scrollY > 10) {
        this.el.nativeElement.classList.add('shadow');
      } else {
        this.el.nativeElement.classList.remove('shadow');
      }
    }
  }

  checkRoute(url: string) {
    this.logoOnly = url === '/checkout';
  }

  

  toggleTheme() {
    this.app.toggleTheme();
    this.updateToggleThemeStatus();
  }

  updateToggleThemeStatus(withoutAnimation = false) {
    const theme = this.app.getTheme();
    if (theme == 'dark') {
      if (withoutAnimation) {
        this.animationItem.goToAndStop(0, true);
      }else{
        this.animationItem.playSegments([100, 0], true);
      }
    } else {
      if (withoutAnimation) {
        this.animationItem.goToAndStop(100, true);
      }else{
        this.animationItem.playSegments([0, 100], true);
      }
    }
  }

  // Metodo chiamato quando l'animazione è pronta
  animationCreated(animation: AnimationItem): void {
    if (this.isPlatformBrowser) {
      this.animationItem = animation;
      this.animationItem.setSpeed(4);
      this.updateToggleThemeStatus(true)
    }
  }


}
