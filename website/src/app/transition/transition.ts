import { Router, ViewTransitionInfo } from "@angular/router";
import { TransitionService } from "../service/transition.service";
import { inject } from "@angular/core";


export function onViewTransitionCreated(info: ViewTransitionInfo) {
  const router = inject(Router);
  const transitionService = inject(TransitionService);

  transitionService.currentTransition.set(info);
  
  const currentNavigation = router.getCurrentNavigation()!
  // const initialUrl = currentNavigation.initialUrl!;
  const targetUrl = currentNavigation!.finalUrl!;


  // Skip the transition if the only thing 
  // changing is the fragment and queryParams
  if (router.isActive(targetUrl, { 
    paths: 'exact', 
    matrixParams: 'exact',
    fragment: 'ignored',
    queryParams: 'ignored',
  })) {
    info.transition.skipTransition();
  }

  info.transition.finished.finally(() => {
    transitionService.currentTransition.set(null);
  });
}