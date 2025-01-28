import { Component, OnInit, inject } from '@angular/core';
import { AppService } from '../../service/app.service';

@Component({
    selector: 'app-privacy-policy',
    imports: [],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {

  public app = inject(AppService);
  
  async ngOnInit() {
    this.app.pageTitle.set('Privacy Policy');
  }

}

