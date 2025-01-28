import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { enableDebugTools } from '@angular/platform-browser';


bootstrapApplication(AppComponent, appConfig).then((appRef) => {
  enableDebugTools(appRef.components[0]);
}).catch((err) => console.error(err));
