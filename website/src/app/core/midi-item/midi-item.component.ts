import { Component, ElementRef, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MidiDto } from 'common';
import { MidiImgComponent } from '../midi-img/midi-img.component';
import { RouterLink } from '@angular/router';
import { AppService } from '../../service/app.service';
import { MidiPlayerService } from '../../service/midi-player.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { PlayButtonComponent } from "../play-button/play-button.component";
import { TransitionService } from '../../service/transition.service';
import { LottieComponent, AnimationOptions, LottieTransferState } from 'ngx-lottie';

@Component({
    selector: 'midi-item',
    imports: [
        NgOptimizedImage,
        CommonModule,
        LottieComponent,
        MidiImgComponent,
        RouterLink,
        PlayButtonComponent,
    ],
    templateUrl: './midi-item.component.html',
    styleUrl: './midi-item.component.scss'
})
export class MidiItemComponent {

  public app = inject(AppService);
  private router = inject(Router);
  public midiPlayer = inject(MidiPlayerService);
  private transitionService = inject(TransitionService);

  private lottieTransferState = inject(LottieTransferState);

  private el = inject(ElementRef)

  public get isPlaying(){
    return this.midiPlayer.isPlayingMidi(this.midi);
  }

  public addToCartLottie = {
    options: {
      // path: '/icons/anim-add-to-cart.json',
      animationData: this.lottieTransferState.get('anim-add-to-cart.json'),
      loop: false,
      autoplay: true
    } as AnimationOptions,
    show: false,
    completed: false,
    complete: () => {
      this.addToCartLottie.completed = true;
    }
  }

  @Input()
  priority = false;

  @Input()
  public midi!: MidiDto

  public viewTransition() {
    const transitionInfo = this.transitionService.currentTransition();
    // If we're transitioning to or from the midi's detail page, add the `midi-image` transition name.
    // This allows the browser to animate between the specific midi image from the list and its image on the detail page.
    const transition = transitionInfo?.to.firstChild?.params['slug'] === this.midi.slug || transitionInfo?.from.firstChild?.params['slug'] === this.midi.slug;
    (this.el.nativeElement as HTMLElement).classList.toggle('transition', transition)
    if(transition){
      this.priority = true; // TODO
    }
    return transition
  }

  public addToCart(event: MouseEvent){
    event.preventDefault();
    event.stopPropagation();
    this.addToCartLottie.show = true;
    this.app.addToCart(this.midi, event);
  }

  public goToCart(event: MouseEvent){
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/checkout']);
  }

}
