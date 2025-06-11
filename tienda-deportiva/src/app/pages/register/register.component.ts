import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Community, Country, Province } from '@app/models/locations';
import { Usuario } from '@app/models/user';
import { AuthService } from '@app/core/services/auth.service';
import { LocationService } from '@app/core/services/location.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  templateUrl: './register.component.html'
})
export default class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly location = inject(LocationService);
  countries = signal<Country[]>([]);
  communities = signal<Community[]>([]);
  provinces = signal<Province[]>([]);
  loading = signal(false);
  isSpain = signal(false);
  errorMessage = signal('');
  registerForm!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.selectCountry();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    const creds = this.registerForm.value;

    this.authService.register(creds).subscribe({
      next: ({ user, token }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user as Usuario));
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al registrarse');
        this.loading.set(false);
      }
    });
  }

  private buildForm(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      isoCode: ['', Validators.required],
      communityId: [''],
      provinceId: ['']
    });
  }

  private selectCountry(): void {
    this.location.getCountries().subscribe((c) => this.countries.set(c));
    this.location.getCommunities().subscribe((c) => this.communities.set(c));

    this.registerForm.get('isoCode')!.valueChanges.subscribe((code) => {
      const spain = code?.toUpperCase() === 'ES';
      this.isSpain.set(spain);

      const commCtrl = this.registerForm.get('communityId')!;
      const provCtrl = this.registerForm.get('provinceId')!;

      if (spain) commCtrl.enable();
      else {
        commCtrl.reset('');
        provCtrl.reset('');
      }
    });

    this.registerForm.get('communityId')!.valueChanges.subscribe((cid) => {
      const provCtrl = this.registerForm.get('provinceId')!;
      provCtrl.reset('');
      if (cid) {
        this.location.getProvinces(cid).subscribe((p) => {
          this.provinces.set(p);
          provCtrl.enable();
        });
      } else {
        this.provinces.set([]);
        provCtrl.disable();
      }
    });
  }
}
