import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, Signal, computed, effect, inject, signal } from '@angular/core';
import { UserDto, MidiCartDto } from 'common';

// random alphanum key for local storage
const LOCAL_STORAGE_KEY = 'b04235e2-120d';

interface LocalStorageData {
  user: UserDto,
  cart: {
    items: MidiCartDto[],
    total: number
  },
  home: {
    latestItemsPage: number
  },
  theme: 'light' | 'dark'
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
  },
  theme: 'light'
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private window = inject(DOCUMENT).defaultView!;
  private localStorage!: Storage

  private readonly local = {
    get: () => (this.localStorage ? JSON.parse(this.localStorage.getItem(LOCAL_STORAGE_KEY) || JSON.stringify(LOCAL_STORAGE_INIT)) : LOCAL_STORAGE_INIT) as LocalStorageData,
    set: (data: LocalStorageData) => this.localStorage?.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }

  public readonly user = signal<UserDto>(LOCAL_STORAGE_INIT.user)

  public readonly cart = {
    items: signal<MidiCartDto[]>(LOCAL_STORAGE_INIT.cart.items),
    total: signal<number>(LOCAL_STORAGE_INIT.cart.total)
  }

  public readonly home = {
    latestItemsPage: signal<number>(0)
  }

  public readonly theme = signal<'light' | 'dark'>(LOCAL_STORAGE_INIT.theme)

  constructor() {
    if(this.isPlatformBrowser) {
      (this.window as any).StorageService = this;
      this.localStorage = this.window?.localStorage;
    }
    const data = this.local.get();
    this.user.set(data.user);
    this.cart.items.set(data.cart.items);
    this.theme.set(data.theme);
    effect(() => {
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
        },
        theme: this.theme()
      });
    });
  }

}
