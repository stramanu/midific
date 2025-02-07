import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private transferState = inject(TransferState);
  private document = inject(DOCUMENT)

  constructor() {}

  /**
   * Genera i dati strutturati per un file MIDI
   */
  generateMidiJsonLd(midi: { title: string; slug: string; price: number }) {
    return {
      '@context': 'https://schema.org/',
      '@type': 'MusicRecording',
      'name': midi.title,
      'url': `https://tuosito.com/midi/${midi.slug}`,
      'inLanguage': 'en',
      'isAccessibleForFree': false,
      'offers': {
        '@type': 'Offer',
        'price': midi.price,
        'priceCurrency': 'EUR',
        'availability': 'https://schema.org/InStock',
        'seller': {
          '@type': 'Organization',
          'name': 'Nome del tuo e-commerce',
        },
      },
    };
  }

  /**
   * Inserisce lo script JSON-LD nel <head>, con supporto a SSR
   */
  insertJsonLd(key: string, jsonLd: object) {
    const stateKey = makeStateKey<string>(`JSON_LD_${key}`);

    if (!this.isBrowser) {
      // Salviamo i dati strutturati nello stato di trasferimento
      this.transferState.set(stateKey, JSON.stringify(jsonLd));
      return;
    }

    // Se siamo nel browser, controlliamo se il dato è stato già inserito
    const existingScript = this.document.querySelector(`script[data-key="${key}"]`);
    if (existingScript) return;

    // Creiamo e inseriamo lo script
    const script = this.document.createElement('script');
    if (!script) return;
    
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.setAttribute('data-key', key);
    this.document.head.appendChild(script);
  }

  /**
   * Imposta il titolo della pagina
   */
  setTitle(title: string) {
    if (this.document) {
      this.document.title = title;
    }
  }

  /**
   * Imposta i meta tag per la descrizione, keywords, Open Graph e Twitter
   */
  setMetaTags(meta: { description?: string; keywords?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; twitterTitle?: string; twitterDescription?: string; twitterImage?: string }) {
    if (!this.document) return;

    const metaTags = [
      { name: 'description', content: meta.description },
      { name: 'keywords', content: meta.keywords },
      { property: 'og:title', content: meta.ogTitle },
      { property: 'og:description', content: meta.ogDescription },
      { property: 'og:image', content: meta.ogImage },
      { name: 'twitter:title', content: meta.twitterTitle },
      { name: 'twitter:description', content: meta.twitterDescription },
      { name: 'twitter:image', content: meta.twitterImage },
    ];

    metaTags.forEach(tag => {
      if (tag.content) {
        let element = this.document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`);
        if (!element) {
          element = this.document.createElement('meta');
          if (tag.name) {
            element.setAttribute('name', tag.name);
          } else if (tag.property) {
            element.setAttribute('property', tag.property);
          }
          this.document.head.appendChild(element);
        }
        element.setAttribute('content', tag.content);
      }
    });
  }

  /**
   * Rimuove i meta tag esistenti
   */
  removeMetaTags() {
    if (!this.document) return;

    const metaTags = [
      'description',
      'keywords',
      'og:title',
      'og:description',
      'og:image',
      'twitter:title',
      'twitter:description',
      'twitter:image',
    ];

    metaTags.forEach(tag => {
      const element = this.document.querySelector(`meta[${tag.startsWith('og:') ? 'property' : 'name'}="${tag}"]`);
      if (element) {
        this.document.head.removeChild(element);
      }
    });
  }
}