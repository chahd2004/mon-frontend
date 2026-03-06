// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const publicUrls: string[] = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/assets/',
    '/environments/'
  ];

  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  if (isPublicUrl) {
    return next(req);
  }

  const token = authService.getToken();

  // ✅ MODE TEST : pas de token → laisser passer sans Authorization
  if (!token) {
    if (!environment.production) {
      console.warn('⚠️ Aucun token trouvé, requête envoyée sans Authorization (mode test)');
    }
    return next(req); // ← plus de redirection, ni de header ajouté
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!environment.production) {
    console.log(`🔐 [JWT] ${req.method} ${req.url} — token ajouté`);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        console.warn('⛔ Token expiré (401) — déconnexion');
        authService.logout();
        router.navigate(['/login'], { queryParams: { session: 'expired' } });
        return throwError(() => new Error('Session expirée, veuillez vous reconnecter'));
      }

      if (error.status === 403) {
        console.warn('⛔ Accès refusé (403) — droits insuffisants');
        router.navigate(['/dashboard']);
        return throwError(() => new Error('Accès non autorisé à cette ressource'));
      }

      if (error.status === 0) {
        console.error('🌐 Erreur réseau ou CORS');
        return throwError(() => new Error('Impossible de contacter le serveur'));
      }

      return throwError(() => error);
    })
  );
};