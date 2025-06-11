import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '@app/core/services/product.service';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admi-editar',
  imports: [ReactiveFormsModule, RouterLink, CommonModule, TranslateModule],
  templateUrl: './admi-editar.component.html'
})
export default class AdmiEditarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productoService = inject(ProductService);
  form!: FormGroup;
  loading = signal(false);
  id = signal('');

  ngOnInit(): void {
    this.buildForm();
    const snapshotId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.id.set(snapshotId);
    this.loadData();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      image: ['']
    });
  }

  private loadData(): void {
    this.loading.set(true);
    this.productoService
      .getEntitieById(this.id())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (prod) => this.form.patchValue(prod),
        error: (err) => alert(err.error?.message || 'No se pudo cargar el producto')
      });
  }

  update(): void {
    if (this.form.invalid) return;

    this.loading.set(true);

    this.productoService
      .update(this.id(), this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin'], {
            queryParams: { success: 'edited' }
          });
        },
        error: (err) => alert(err.error?.message || 'No se pudo actualizar el producto')
      });
  }

  onFileSelected(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ image: reader.result as string });
    reader.readAsDataURL(file);
  }
}
