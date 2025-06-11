import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ProductService } from './product.service';
import { CartItem } from '@app/models/cart';
import { Producto } from '@app/models/product';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);

  private get storageKey(): string {
    const id = this.auth.currentUser?.id ?? 'anon';
    return `cart_${id}`;
  }

  private read(): CartItem[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  }

  private write(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  get items(): CartItem[] {
    return this.read();
  }

  add(product: Producto, qty: number): boolean {
    const items = this.read();
    const idx = items.findIndex((p) => p.id === product.id);
    const currentQty = idx > -1 ? items[idx].quantity : 0;
    const wanted = currentQty + qty;

    if (wanted > product.stock) return false;

    if (idx > -1) items[idx].quantity = wanted;
    else items.push({ ...product, quantity: qty });

    this.write(items);
    return true;
  }

  updateQuantity(id: string, qty: number): void {
    const items = this.read();
    const idx = items.findIndex((i) => i.id === id);
    if (idx > -1) {
      if (qty < 1) items.splice(idx, 1);
      else items[idx].quantity = qty;
      this.write(items);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStockAfterPurchase(): Observable<any[]> {
    const items = this.items;
    const calls = items.map((item: CartItem) => {
      const newStock = item.stock - item.quantity;
      return this.productService.update(item.id, { stock: newStock });
    });
    return forkJoin(calls);
  }

  remove(id: string): void {
    const items = this.read().filter((i) => i.id !== id);
    this.write(items);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  get total(): number {
    return this.read().reduce((s, i) => s + i.price * i.quantity, 0);
  }
}
