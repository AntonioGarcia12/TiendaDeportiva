import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CartItem } from '@app/models/cart';
import { Purchase } from '@app/models/purchase';
import { environment } from '@env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/purchases`;

  fetchHistory(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.url}/list`);
  }

  recordPurchase(items: CartItem[], total: number): Observable<void> {
    return this.http.post<void>(`${this.url}/create`, { items, total });
  }
}
