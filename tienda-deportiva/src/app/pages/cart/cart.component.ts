import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CartItem } from '@app/models/cart';
import { CartService } from '@app/core/services/cart.service';
import { ProductService } from '@app/core/services/product.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './cart.component.html'
})
export default class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  dialogDeleteVisible = signal(false);

  inc(item: CartItem): void {
    this.productService.getEntitieById(item.id).subscribe((prod) => {
      if (item.quantity < prod.stock) this.cartService.updateQuantity(item.id, item.quantity + 1);
    });
  }

  dec(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity - 1);
  }

  remove(id: string): void {
    this.cartService.remove(id);
  }

  clear(): void {
    this.dialogDeleteVisible.set(true);
  }

  buy(): void {
    this.router.navigate(['/checkout']);
  }
  confirmClear(): void {
    this.cartService.clear();
    this.dialogDeleteVisible.set(false);
  }
  cancelDelete(): void {
    this.dialogDeleteVisible.set(false);
  }

  get items(): CartItem[] {
    return this.cartService.items;
  }
  get total(): number {
    return this.cartService.total;
  }
}
