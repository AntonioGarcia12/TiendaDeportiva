import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean | UrlTree {
    if (this.auth.token && this.auth.isAdmin()) return true;

    if (this.auth.token && !this.auth.isAuthenticated()) this.auth.clear();

    return this.router.parseUrl('/login');
  }
}
