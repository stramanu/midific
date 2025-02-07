import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal, effect } from '@angular/core';
import { UserDto, MidiCartDto } from 'common';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

const LOCAL_STORAGE_KEY = 'b04235e2-120d';
const COOKIE_KEY = 'b04235e2-120d';

type Theme = 'light' | 'dark';

interface LocalStorageData {
  user: UserDto,
  cart: {
    items: MidiCartDto[],
    total: number
  },
  home: {
    latestItemsPage: number
  }
}

interface CookieData {
  theme: Theme
}

const LOCAL_STORAGE_INIT: LocalStorageData = {
  user: {
    email: ''
  },
  cart: {
    items: [],
    total: -1
  },
  home: {
    latestItemsPage: 0
  }
}

const COOKIES_INIT: CookieData = {
  theme: 'light'
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private window = inject(DOCUMENT).defaultView!;
  private cookieService = inject(SsrCookieService);

  // Local storage and cookie access methods
  private readonly local = {
    get: () => (this.window.localStorage ? JSON.parse(this.window.localStorage.getItem(LOCAL_STORAGE_KEY) || JSON.stringify(LOCAL_STORAGE_INIT)) : LOCAL_STORAGE_INIT) as LocalStorageData,
    set: (data: LocalStorageData) => this.window.localStorage?.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }
  private readonly cookie = {
    get: () => (this.cookieService.check(COOKIE_KEY) ? JSON.parse(this.cookieService.get(COOKIE_KEY) || JSON.stringify(COOKIES_INIT)) : COOKIES_INIT) as CookieData,
    set: (data: CookieData) => this.cookieService.set(COOKIE_KEY, JSON.stringify(data), { path: '/' })
  }

  // Local storage signals
  public readonly user = signal<UserDto>(LOCAL_STORAGE_INIT.user)
  public readonly cart = {
    items: signal<MidiCartDto[]>(LOCAL_STORAGE_INIT.cart.items),
    total: signal<number>(LOCAL_STORAGE_INIT.cart.total)
  }
  public readonly home = {
    latestItemsPage: signal<number>(LOCAL_STORAGE_INIT.home.latestItemsPage)
  }

  // Cookie signals
  public readonly theme = signal<Theme>(COOKIES_INIT.theme)

  constructor() {

    // Init signal values from local storage and cookies
    
    const local = this.local.get();
    this.user.set(local.user);
    this.cart.items.set(local.cart.items);
    
    const cookies = this.cookie.get();
    this.theme.set(cookies.theme);

    effect(() => {
      
      // Update local storage when signals change
      const items = this.cart.items()
      let total = items.reduce((acc, item) => item.checked ? acc + item.price : acc, 0)
      total = Math.round(total * 100) / 100
      this.cart.total.set(total)

      this.local.set({
        user: this.user(),
        cart: {
          items,
          total
        },
        home: {
          latestItemsPage: this.home.latestItemsPage()
        }
      });
        
      // Update cookies when signals change

      this.cookie.set({
        theme: this.theme()
      });

    });
  }
}
