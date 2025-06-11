import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Producto } from '@app/models/product';
import { RatingComponent } from '@app/common/rating/rating.component';
import { ProductService } from '@app/core/services/product.service';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterLink, TranslateModule, RatingComponent],
  templateUrl: './search.component.html'
})
export default class SearchComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  category = signal<'all' | string>('all');
  products = signal<Producto[]>([]);
  query = signal('');
  page = signal(1);
  pageSize = signal(8);
  totalPages = signal(1);
  loading = signal(false);
  error = signal('');
  results = computed(() => this.products());

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.query.set((params['q'] || '').trim());
      this.category.set(params['category'] || 'all');
      this.page.set(1);
      this.fetchPage();
    });
  }

  private fetchPage(): void {
    this.loading.set(true);
    this.productService.getProductosPaginated(this.page(), this.pageSize(), 'asc', this.query(), this.category()).subscribe({
      next: ({ entities, pagination }) => {
        this.products.set(entities);
        this.totalPages.set(pagination.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al cargar productos');
        this.loading.set(false);
      }
    });
  }

  prev(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.fetchPage();
    }
  }
  next(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.fetchPage();
    }
  }
  goto(p: number): void {
    if (p !== this.page()) {
      this.page.set(p);
      this.fetchPage();
    }
  }

  viewProduct(id: string): void {
    this.route.navigate(['/view-product', id]);
  }
}
