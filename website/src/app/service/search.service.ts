import { Injectable, inject, signal } from '@angular/core';
import { MidiDto } from 'common';
import { Subject } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { AppService } from './app.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private app = inject(AppService);
  private api = inject(ApiService);
  private router = inject(Router);
  
  public searchItems = signal<MidiDto[]>([]);
  
  // define event for search query
  private _searchQuery = '';
  private latestSearchQuery = '';
  private searchPage = 0;
  public searchQuery = new Subject<string>();
  public searchMore = new Subject();

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.searchQuery.next('')
        setTimeout(() => {
          // console.log('routeChange.subscribe', this.route.snapshot.paramMap.get('query'));
          // this.search.searchQuery.next(this.route.snapshot.paramMap.get('query') || '');
        })
      }
    })
    this.searchQuery.subscribe(async (query) => {
      if (query && query.length >= 3){ 
        // console.log('searchQuery.subscribe', this.router.url, encodeURI('/search/' + query));
        // if url is not the same as the search query, navigate to it
        if (this.router.url !== encodeURI('/search/' + query)){
          // console.log('navigating to', query);
          await this.router.navigate(['/search', query]);
          return
        }
        this._searchQuery = query;
        this.doSearch()
      }else{
        // console.log('searchQuery.subscribe', query, 'is not valid');
      }
    })
    this.searchMore.subscribe(() => {
      this.searchPage++;
      this.doSearch();
    })
  }

  public async doSearch(query = this._searchQuery) {
    if (query && query.length >= 3){
      this.app.loading.set(true);
      if (query !== this.latestSearchQuery) {
        this.searchPage = 0;
      }
      this.latestSearchQuery = query;
      const items = await this.api.searchMidi(query, this.searchPage);
      if (this.searchPage === 0){
        this.searchItems.set(items);
      }else{
        this.searchItems.set([...this.searchItems(), ...items]);
      }
      this.app.pageTitle.set('Search results for: ' + query);
      this.app.loading.set(false);
    }
  }

}
