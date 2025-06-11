import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '@app/core/services/product.service';
import { Utils } from '@app/utils/utils';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-create',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './admin-create.component.html'
})
export default class AdminCreateComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  form!: FormGroup;
  loading = signal(false);
  imageReady = signal(false);
  defaultImageBase64 = Utils.defaultImageBase64;

  ngOnInit(): void {
    this.buildForm();
  }

  onFileSelected(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ image: reader.result as string });
      this.imageReady.set(true);
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.productService
      .create(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin'], {
            queryParams: { success: 'created' }
          });
        },
        error: (err) => alert(err.error?.message || 'No se pudo crear el producto')
      });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      stock: ['', Validators.required],
      image: [this.defaultImageBase64]
    });
  }
}
