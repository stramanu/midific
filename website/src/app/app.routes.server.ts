import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';

export const serverRoutes: Array<ServerRoute> = [
    {
      path: '',
      renderMode: RenderMode.Server
    },{ 
        path: 'search/:query',
        renderMode: RenderMode.Server
    },{ 
        path: 'midi/:slug',
        renderMode: RenderMode.Server,
        // renderMode: RenderMode.Prerender // TODO: enable prerender
        // async getPrerenderParams(): Promise<Array<Record<string, string>>> {
        //     // API call to get the user IDs
        //     const userIds = await inject(UserService).getUserIds(); 
        //     // build an array like [{ id: '1' }, { id: '2' }, { id: '3' }]
        //     return userIds.map(id => ({ id }));
        //   }
    },{ 
        path: 'checkout',
        renderMode: RenderMode.Server
    },
    // @ts-ignore
    { 
        path: 'privacy-policy', 
        renderMode: environment.production ? RenderMode.Prerender : RenderMode.Server
    },
    // @ts-ignore
    { 
        path: 'cookie-policy',
        renderMode: environment.production ? RenderMode.Prerender : RenderMode.Server
    },{ 
        path: '**', 
        renderMode: RenderMode.Client
    }
  ];