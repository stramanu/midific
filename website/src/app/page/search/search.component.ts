import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MidiListComponent } from '../../core/midi-list/midi-list.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { syncRun } from '../../utils/debounce';
import { ApiService } from '../../service/api.service';
import { Subscription } from 'rxjs';
import { SearchService } from '../../service/search.service';

@Component({
    selector: 'app-search',
    imports: [
        MidiListComponent
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {

  @Input()
  public search = inject(SearchService);
  public api = inject(ApiService);
  public route = inject(ActivatedRoute);
  public router = inject(Router);

  @ViewChild('midiList', { static: true, read: ElementRef }) midiList!: ElementRef<HTMLDivElement>;

  subscriptions: {
    [key: string]: Subscription
  } = {
    routeChange: this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          // console.log('routeChange.subscribe', this.route.snapshot.paramMap.get('query'));
          this.search.searchQuery.next(this.route.snapshot.paramMap.get('query') || '');
        })
      }
    })
  }

  public syncSearchItems = syncRun(() => {
    this.search.searchMore.next(void 0);
  });

  async ngOnInit() {
    // console.log('SearchComponent ngOnInit', this.route.snapshot.paramMap.get('query'));
  }

  // @HostListener('window:popstate', ['$event'])
  // onPopState(event: PopStateEvent) {
  //   setTimeout(() => {
  //     // this.search.searchQuery.next(this.route.snapshot.paramMap.get('query') || '');
  //   })
  // }

  ngOnDestroy() {
    for (const key in this.subscriptions) {
      this.subscriptions[key].unsubscribe();
    }
  }

  @HostListener('document:scroll', ['$event'])
  public onScroll(event: Event) {
    if (!this.midiList || !this.midiList.nativeElement) return;
    const el = this.midiList.nativeElement;
    const scrollTop = (event.target as Document).documentElement.scrollTop;
    if (el && scrollTop > el.offsetTop + el.scrollHeight - document.documentElement.clientHeight - 500) {
      this.syncSearchItems();
    }
  }

}
