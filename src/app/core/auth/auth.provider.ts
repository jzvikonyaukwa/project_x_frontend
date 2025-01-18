import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
import { authInterceptor } from './auth.interceptor';

export const provideAuth = (): Array<Provider | EnvironmentProviders> => {
  return [
    provideHttpClient(withInterceptors([authInterceptor])),
    // {
    //   provide: ENVIRONMENT_INITIALIZER,
    //   useValue: () => inject(AuthService),
    //   multi: true,
    // },
  ];
};
