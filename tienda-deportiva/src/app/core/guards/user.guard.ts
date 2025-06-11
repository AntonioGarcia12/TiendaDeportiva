import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean | UrlTree {
    const token = this.auth.token;

    if (!token) return true;

    if (this.auth.token && this.auth.isUser()) return true;

    if (token && !this.auth.isAuthenticated()) {
      this.auth.clear();
      return this.router.parseUrl('/login');
    }

    this.auth.clear();
    return this.router.parseUrl('/login');
  }
}
