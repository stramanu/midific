import { Component, OnInit, inject } from '@angular/core';
import { AppService } from '../../service/app.service';

@Component({
    selector: 'app-cookie-policy',
    imports: [],
    templateUrl: './cookie-policy.component.html',
    styleUrl: './cookie-policy.component.scss'
})
export class CookiePolicyComponent implements OnInit {

  public app = inject(AppService);
  
  async ngOnInit() {
    this.app.pageTitle.set('Cookie Policy');
  }

}

