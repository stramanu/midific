import { Component, ElementRef, Input, Signal, WritableSignal, inject, isSignal, signal } from '@angular/core';
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
    const midi = this.midi();
    return midi != null ? this.midiPlayer.isPlayingMidi(midi) : false;
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

  private _midi = signal<MidiDto|null>(null);

  @Input()
  public set midi(midi: (MidiDto|null)|WritableSignal<MidiDto|null>) {
    if(isSignal(midi)){
      this._midi = midi;
    }else{
      this._midi.set(midi);
    }
  }
  public get midi(): WritableSignal<MidiDto|null>{
    return this._midi;
  }

  public get transition() {
    const transitionInfo = this.transitionService.currentTransition();
    const transition = transitionInfo?.to.firstChild?.params['slug'] === this.midi()?.slug;
    (this.el.nativeElement as HTMLElement).classList.toggle('transition', transition)
    if(transition){
      this.priority = true;
    }
    return transition
  }

  public addToCart(event: MouseEvent){
    event.preventDefault();
    event.stopPropagation();
    this.addToCartLottie.show = true;
    const midi = this.midi();
    if(midi != null){
      this.app.addToCart(midi, event);
    }
  }

  public goToCart(event: MouseEvent){
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/checkout']);
  }

}
