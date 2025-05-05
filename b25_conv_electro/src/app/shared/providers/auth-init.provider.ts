import { APP_INITIALIZER, inject } from '@angular/core';
import { AuthService } from '../../supabase/auth.service';


export function authInitializer() {
  return async () => {
    const authService = inject(AuthService);
    await authService.restoreSession();

  };
}

export const AuthInitProvider = {
  provide: APP_INITIALIZER,
  useFactory: authInitializer,
  multi: true,
  deps: []
};
