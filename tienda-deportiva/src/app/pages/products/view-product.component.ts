import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '@app/core/services/cart.service';
import { ProductService } from '@app/core/services/product.service';
import { RatingService } from '@app/core/services/rating.service';
import { Producto } from '@app/models/product';
import { Rating } from '@app/models/rating';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-product',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './view-product.component.html'
})
export default class ViewProductComponent implements OnInit {
  private readonly productoService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly ratingService = inject(RatingService);
  private readonly route = inject(ActivatedRoute);
  readonly Math = Math;
  loading = signal(false);
  id = signal('');
  producto = signal<Producto | null>(null);
  cant = signal(0);
  showAddDialog = signal(false);
  ratings = signal<Rating[]>([]);
  ratingsAverage = signal(0);
  ratingsCount = signal(0);

  ngOnInit(): void {
    const snapshotId = this.route.snapshot.paramMap.get('id') ?? '';
    this.id.set(snapshotId);
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.productoService
      .getEntitieById(this.id())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (prod) => {
          this.producto.set(prod);
          this.cant.set(1);

          this.ratingService.list(prod.id).subscribe({
            next: ({ ratings, average, count }) => {
              this.ratings.set(ratings);
              this.ratingsAverage.set(average);
              this.ratingsCount.set(count);
            },
            error: () => {
              this.ratings.set([]);
              this.ratingsAverage.set(0);
              this.ratingsCount.set(0);
            }
          });
        },
        error: (err) => alert(err.error?.message || 'No se pudo cargar el producto')
      });
  }

  addToCart(): void {
    const prod = this.producto();
    const cantidad = this.cant();

    if (!prod) return;

    if (cantidad < 1 || cantidad > prod.stock) return;

    const enCarrito = this.cartService.items.find((i) => i.id === prod.id)?.quantity ?? 0;
    if (enCarrito + cantidad > prod.stock) return;

    this.cartService.add(prod, cantidad);
    this.showAddConfirmation();
  }

  showAddConfirmation() {
    this.showAddDialog.set(true);
    setTimeout(() => this.showAddDialog.set(false), 2000);
  }
}
