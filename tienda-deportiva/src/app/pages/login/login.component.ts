import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './login.component.html'
})
export default class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly activatedRoute = inject(Router);
  private readonly authService = inject(AuthService);
  loading = signal(false);
  errorMessage = signal('');
  errorMessageAdmin = signal(false);
  seePassword = signal(false);
  loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  visiblePassword(): void {
    this.seePassword.update((v) => !v);
  }
  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.errorMessageAdmin.set(false);

    const creds = this.loginForm.value;

    this.authService.login(creds).subscribe({
      next: ({ user, token }) => {
        this.authService.setSession(token, user.role, user);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl === '/cart' && user.role === 'ADMIN') {
          this.errorMessageAdmin.set(true);
          this.loading.set(false);
          this.authService.clear();
          return;
        }
        const defaultRoute = this.authService.isAdmin() ? '/admin' : '/home';
        this.activatedRoute.navigateByUrl(returnUrl ?? defaultRoute);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message);
        this.loading.set(false);
      }
    });
  }
}
