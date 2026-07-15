import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { CoreModule } from './core/core.module';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(),
    provideRouter(routes),

    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, authInterceptor, loadingInterceptor])),
    //importProvidersFrom(CoreModule),
    importProvidersFrom(FormsModule),
    importProvidersFrom(ReactiveFormsModule),
  ],
};
