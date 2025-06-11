import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, forkJoin, map, startWith, timer } from 'rxjs';
import { Utils } from '@app/utils/utils';
import { Producto } from '@app/models/product';
import { RatingComponent } from '@app/common/rating/rating.component';
import { ProductService } from '@app/core/services/product.service';
import { AuthService } from '@app/core/services/auth.service';
import { RatingService } from '@app/core/services/rating.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink, RatingComponent],
  templateUrl: './home.component.html'
})
export default class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly ratingService = inject(RatingService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private hideSportsTimer = signal<number | null>(null);
  readonly translate = inject(TranslateService);
  readonly categories = signal<string[]>([]);
  allProducts = signal<Producto[]>([]);
  activeCategory = signal<string | null>(null);
  topRated = signal<Producto[]>([]);
  searcher = new FormControl('', { nonNullable: true });
  loading = signal(false);
  showSportsMenu = signal(false);
  errorMessage = signal(false);
  menuOpen = signal(false);
  showLogoutDialog = signal(false);
  showResults = signal(false);
  successMessage = signal<string | null>(null);
  avgRatings = signal<Record<string, number>>({});
  searchTerm = toSignal(this.searcher.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()), {
    initialValue: ''
  });

  results = computed(() => Utils.filterProductsByTerm(this.allProducts(), this.searchTerm()));

  ngOnInit(): void {
    const msg = this.activatedRoute.snapshot.queryParamMap.get('success');
    if (msg) {
      this.successMessage.set(msg);
      timer(2000).subscribe(() => {
        this.successMessage.set(null);
        this.route.navigate([], { queryParams: {}, replaceUrl: true });
      });
    }
    this.fetchProducts();
  }

  search() {
    const term = this.searcher.value.trim();
    if (!term || /\d/.test(term) || term.length < 3) {
      this.showResults.set(false);
      return;
    }
    this.route.navigate(['/search'], { queryParams: { q: term } });
  }

  cambiarIdioma(lang: 'es' | 'en'): void {
    this.translate.use(lang);
  }

  /**
   * Obtiene productos y categorías desde la API y calcula las valoraciones promedio.
   * Rellena las señales allProducts, categories, topRated y avgRatings.
   * Establece la señal loading en true mientras se realiza la carga y en false cuando finaliza.
   * Si ocurre un error, establece la señal errorMessage en true.
   */
  private fetchProducts(): void {
    this.loading.set(true);

    forkJoin({
      products: this.productService.getProducts(),
      categories: this.productService.getCategories()
    }).subscribe({
      next: ({ products, categories }) => {
        this.allProducts.set(products);
        const peticiones = products.map((p) =>
          this.ratingService.list(p.id).pipe(map((res) => ({ id: p.id, avg: res.average ?? 0 })))
        );

        forkJoin(peticiones).subscribe({
          next: (lista) => {
            const mapa: Record<string, number> = {};
            lista.forEach((x) => (mapa[x.id] = x.avg));
            const top4 = [...products].sort((a, b) => (mapa[b.id] ?? 0) - (mapa[a.id] ?? 0)).slice(0, 4);
            this.topRated.set(top4);
            this.avgRatings.set(mapa);
          },
          error: () => this.errorMessage.set(true)
        });

        this.categories.set(categories.sort());
        this.loading.set(false);
      },

      error: () => {
        this.errorMessage.set(true);
        this.loading.set(false);
      }
    });
  }

  viewProduct(id: string): void {
    this.route.navigate(['/view-product', id]);
  }

  viewByCategory(cat: string) {
    this.activeCategory.set(cat);
    this.route.navigate(['/search'], { queryParams: { q: cat } });
    this.showSportsMenu.set(false);
  }

  hideSportsDelayed(): void {
    this.hideSportsTimer.set(
      window.setTimeout(() => {
        this.showSportsMenu.set(false);
        this.hideSportsTimer.set(null);
      }, 300)
    );
  }

  showSports(): void {
    if (this.hideSportsTimer()) {
      clearTimeout(this.hideSportsTimer()!);
      this.hideSportsTimer.set(null);
    }
    this.showSportsMenu.set(true);
  }
  cart(): void {
    const target = `/cart`;
    if (this.isLogged) this.route.navigate([target]);
    else {
      this.route.navigate(['/login'], {
        queryParams: { returnUrl: target }
      });
    }
  }

  get isLogged(): boolean {
    return this.auth.isAuthenticated();
  }
  get userName(): string {
    return this.auth.currentUser?.name ?? '';
  }

  logout(): void {
    this.showLogoutDialog.set(true);
  }

  confirmLogout(): void {
    this.auth.clear();
    this.route.navigate(['/home']);
    this.showLogoutDialog.set(false);
  }

  cancelLogout(): void {
    this.showLogoutDialog.set(false);
  }
}
