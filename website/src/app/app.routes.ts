import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { inject, signal } from '@angular/core';
import { ApiService } from './service/api.service';
import { MidiDto } from 'common';
import { SearchService } from './service/search.service';
import { StorageService } from './service/storage.service';
import { MidiComponent } from './page/midi/midi.component';

export const routes: Routes = [
    { 
        path: '',
        loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent),
        resolve: {
            latestMidiItems: async () => {
                // tieni conto dello scroll per ripristinare la pagina e ricaricare tutti gli elementi non utili
                return signal<MidiDto[]>(await inject(ApiService).latestMidi(0, (inject(StorageService).home.latestItemsPage() +1) * 18))
            },
            forYouMidiItems: async () => 
                signal<MidiDto[]>(await inject(ApiService).forYouMidi())
        }
    },{ 
        path: 'search/:query',
        loadComponent: () => import('./page/search/search.component').then(m => m.SearchComponent),
        resolve: {
            search: async (route: ActivatedRouteSnapshot) => {
                const search = inject(SearchService);
                // search.searchQuery.next(route.params['query'] || '');
                await search.doSearch(route.params['query'] || '');
                return search;
            }
        }
    },{ 
        path: 'midi/:slug',
        component: MidiComponent,
        // loadComponent: () => import('./page/midi/midi.component').then(m => m.MidiComponent),
        resolve: {
            midi: async (route: ActivatedRouteSnapshot) => {
                const api = inject(ApiService);
                const slug = route.params['slug'] || '';
                return await api.getMidi(slug);
            },
            forYouMidiItems: async (route: ActivatedRouteSnapshot) => {
                const slug = route.params['slug'] || '';
                return signal<MidiDto[]>((await inject(ApiService).forYouMidi()).filter(m => m.slug !== slug));
            }
        }
    },{ 
        path: 'checkout',
        loadComponent: () => import('./page/checkout/checkout.component').then(m => m.CheckoutComponent),
        resolve: {
            forYouMidiItems: async (route: ActivatedRouteSnapshot) => {
                return signal<MidiDto[]>(await inject(ApiService).forYouMidi());
            }
        }
    },{ 
        path: 'privacy-policy',
        loadComponent: () => import('./page/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
    },{ 
        path: 'cookie-policy',
        loadComponent: () => import('./page/cookie-policy/cookie-policy.component').then(m => m.CookiePolicyComponent)
    },{ 
        path: '**', redirectTo: '/'
    }
];
