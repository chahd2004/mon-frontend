import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ── Guard : utilisateur connecté ──────────────────────────────
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// ── Guard : Admin seulement ───────────────────────────────────
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

// ── Guard : Client seulement ──────────────────────────────────
export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isClient()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

// ── Guard : Emetteur seulement ────────────────────────────────
export const emetteurGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isEmetteur()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

// ── Guard : Déjà connecté → redirige vers dashboard ──────────
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};