import { Component, ElementRef, effect, inject } from '@angular/core';
import { StorageService } from '../../service/storage.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'minicart',
    imports: [NgOptimizedImage],
    templateUrl: './minicart.component.html',
    styleUrl: './minicart.component.scss'
})
export class MinicartComponent {

  private store = inject(StorageService);
  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      this.el.nativeElement.classList.remove('animate');
      setTimeout(() => {
        this.el.nativeElement.classList.add('animate');
      })
    })
  }

  get count() {
    return this.store.cart.items().length;
  }

}
