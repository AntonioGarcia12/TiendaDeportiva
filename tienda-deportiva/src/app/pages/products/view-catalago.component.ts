import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Producto } from '@app/models/product';
import { RatingComponent } from '@app/common/rating/rating.component';
import { ProductService } from '@app/core/services/product.service';

@Component({
  selector: 'app-view-catalago',
  imports: [CommonModule, RouterLink, TranslateModule, RatingComponent],
  templateUrl: './view-catalago.component.html'
})
export default class ViewCatalagoComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(Router);
  productos = signal<Producto[]>([]);
  loading = signal(false);
  dropdownOpen = signal(false);
  errorMessage = signal('');
  categorias = signal<string[]>([]);
  selectedCat = signal<string>('all');
  page = signal(1);
  pageSize = signal(8);
  totalPages = signal(1);
  hasNext = signal(false);
  hasPrev = signal(false);
  sortOrder = signal<'desc' | 'asc' | null>(null);

  /**
   * Lista de productos ordenada por precio según el orden actual (`asc` o `desc`).
   *
   * - Si `sortOrder` no está definido, se devuelve la lista original sin ordenar.
   * - Si `sortOrder` es 'asc', se ordena de menor a mayor precio.
   * - Si `sortOrder` es 'desc', se ordena de mayor a menor precio.
   *
   * @returns {Producto[]} Lista ordenada de productos según el criterio actual.
   */
  sorted = computed(() => {
    const list = [...this.productos()];
    if (!this.sortOrder()) return list;
    return list.sort((a, b) => (this.sortOrder() === 'asc' ? a.price - b.price : b.price - a.price));
  });

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categorias.set(['all', ...cats]),
      error: (err) => console.error('Error al cargar categorías', err)
    });
    this.fetchPage(1);
  }

  private fetchPage(p: number): void {
    this.loading.set(true);

    this.productService.getProductosPaginated(p, this.pageSize(), this.sortOrder() ?? 'asc', '', this.selectedCat()).subscribe({
      next: ({ entities, pagination }) => {
        const filtered = entities.filter((prod) => this.selectedCat() === 'all' || prod.category === this.selectedCat());
        this.productos.set(filtered);
        this.page.set(pagination.page);
        this.totalPages.set(pagination.totalPages);
        this.hasNext.set(pagination.hasNextPage);
        this.hasPrev.set(pagination.hasPrevPage);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error fetching products');
        this.loading.set(false);
      }
    });
  }

  onCategoryChange(cat: string): void {
    this.selectedCat.set(cat);
    this.fetchPage(1);
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  changeSort(order: 'asc' | 'desc' | null): void {
    if (order === this.sortOrder()) return;
    this.sortOrder.set(order);
  }

  prev(): void {
    if (this.hasPrev()) this.fetchPage(this.page() - 1);
  }
  next(): void {
    if (this.hasNext()) this.fetchPage(this.page() + 1);
  }
  goto(p: number): void {
    if (p !== this.page()) this.fetchPage(p);
  }

  viewProduct(id: string): void {
    this.route.navigate(['/view-product', id]);
  }
}
