import { Component, inject } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { MidiDto } from 'common';
import { PaymentService } from '../../service/payment.service';

@Component({
    selector: 'payment',
    templateUrl: './payment.component.html',
    styleUrl: './payment.component.scss',
    standalone: false
})
export class PaymentComponent {

  private api = inject(ApiService)
  private payment = inject(PaymentService);

  public midi: MidiDto | null = null

  async ngOnInit() {
    const midis = await this.api.latestMidi(0, 1)
    this.midi = midis[0]
  }

  async checkout() {
    const result = await this.payment.createCheckoutSession([this.midi!.slug])
    if (result.error) {
      console.error(result.error)
      return
    }
    console.log(result)
  }

}
