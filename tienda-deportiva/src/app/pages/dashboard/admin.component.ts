import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { Utils } from '@app/utils/utils';
import { Producto } from '@app/models/product';
import { ProductService } from '@app/core/services/product.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './admin.component.html'
})
export default class AdminComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(Router);
  private readonly defaultSize = signal(5);
  private readonly searchSize = signal(9999);
  private readonly activatedRoute = inject(ActivatedRoute);
  products = signal<Producto[]>([]);
  searcher = new FormControl('', { nonNullable: true });
  searchTerm = toSignal<string>(this.searcher.valueChanges.pipe(startWith('')));
  loading = signal(false);
  page = signal(1);
  hasNext = signal(false);
  hasPrev = signal(false);
  showLogoutDialog = signal(false);
  totalPages = signal(1);
  filtered = computed(() => Utils.filterProductsByTerm(this.products(), this.searchTerm() ?? ''));
  dialogDeleteVisible = signal(false);
  productIdToDelete = signal<string | null>(null);
  productDeleteVis = signal(false);
  productCreate = signal(false);
  productEdit = signal(false);

  ngOnInit(): void {
    const result = this.activatedRoute.snapshot.queryParamMap.get('success');
    if (result === 'created') {
      this.productCreate.set(true);
      setTimeout(() => this.productCreate.set(false), 2000);
    }
    if (result === 'edited') {
      this.productEdit.set(true);
      setTimeout(() => this.productEdit.set(false), 2000);
    }
    this.fetchPage(1, this.searcher.value);
    this.searcher.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => this.fetchPage(1, term));
  }

  logout(): void {
    this.showLogoutDialog.set(true);
  }

  confirmLogout(): void {
    localStorage.clear();
    this.route.navigate(['login']);
    this.showLogoutDialog.set(false);
  }

  cancelLogout(): void {
    this.showLogoutDialog.set(false);
  }

  private fetchPage(page: number, term = '') {
    this.loading.set(true);
    const size = term.trim() ? this.searchSize() : this.defaultSize();

    this.productService
      .getProductosPaginated(page, size, 'asc', term)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ entities, pagination }) => {
          this.products.set(entities);

          const searching = term.trim().length > 0;

          if (searching) {
            this.page.set(1);
            this.totalPages.set(1);
            this.hasNext.set(false);
            this.hasPrev.set(false);
          } else {
            this.page.set(pagination.page);
            this.totalPages.set(pagination.totalPages);
            this.hasNext.set(pagination.hasNextPage);
            this.hasPrev.set(pagination.hasPrevPage);
          }

          this.loading.set(false);
        }
      });
  }

  private currentTerm(): string {
    return (this.searcher.value ?? '').trim();
  }

  prev() {
    if (this.hasPrev()) this.fetchPage(this.page() - 1, this.currentTerm());
  }
  next() {
    if (this.hasNext()) this.fetchPage(this.page() + 1, this.currentTerm());
  }
  goto(p: number) {
    if (p !== this.page()) this.fetchPage(p, this.currentTerm());
  }

  create() {
    this.route.navigate(['/admin/create']);
  }

  update(id: string) {
    this.route.navigate(['admin', 'edit', id]);
  }

  showDeleteDialog(id: string): void {
    this.productIdToDelete.set(id);
    this.dialogDeleteVisible.set(true);
  }

  cancelDelete(): void {
    this.dialogDeleteVisible.set(false);
    this.productIdToDelete.set(null);
  }

  confirmDelete(): void {
    if (!this.productIdToDelete()) return;

    this.productService.delete(this.productIdToDelete()!).subscribe({
      next: () => {
        this.products.update((l) => l.filter((prod) => prod.id !== this.productIdToDelete()));
        this.cancelDelete();
        this.productDeleteVis.set(true);
        setTimeout(() => this.productDeleteVis.set(false), 2000);
      },
      error: (err) => {
        console.error(err);
        this.cancelDelete();
      }
    });
  }
}
