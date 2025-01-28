import { Component, Input, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounce } from '../../utils/debounce';
import { Subscription } from 'rxjs';
import { SearchService } from '../../service/search.service';

@Component({
    selector: 'search-box',
    imports: [
        FormsModule
    ],
    templateUrl: './search-box.component.html',
    styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent implements OnDestroy {

  private search = inject(SearchService);

  @Input() 
  public placeholder = 'Search...';
  public query = ''

  public doSearch = debounce((query?: string) => this.search.searchQuery.next(this.query), 500);

  subscriptions: {
    [key: string]: Subscription
  } = {
    searchQuery: this.search.searchQuery.subscribe(query => {
      this.query = query;
    })
  }

  ngOnDestroy() {
    for (const key in this.subscriptions) {
      this.subscriptions[key].unsubscribe();
    }
  }

}
