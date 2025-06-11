import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PaginatedResponse } from '@app/models/pagination';
import { NewProducto, Producto } from '@app/models/product';
import { environment } from '@env';
import { catchError, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly urlEntities = `${environment.apiBaseUrl}/api/entities`;
  private readonly urlPaginated = `${environment.apiBaseUrl}/api/paginated-entities`;
  private readonly urlCategories = `${environment.apiBaseUrl}/api/categories`;

  create(data: NewProducto): Observable<Producto> {
    const params = { table: 'Producto' };
    return this.http.post<Producto>(`${this.urlEntities}?table=${params.table}`, data).pipe(
      catchError((err) => {
        console.error('Error en create:', err);
        return throwError(() => err);
      })
    );
  }

  getProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.urlEntities}?table=Producto`).pipe(
      catchError((err) => {
        console.error('Error en getProducts:', err);
        return throwError(() => err);
      })
    );
  }

  getEntitieById(id: string): Observable<Producto> {
    const params = { table: 'Producto' };
    return this.http.get<Producto>(`${this.urlEntities}/${id}?table=${params.table}`).pipe(
      catchError((err) => {
        console.error('Error en delete:', err);
        return throwError(() => err);
      })
    );
  }
  delete(id: string): Observable<Producto> {
    const params = { table: 'Producto' };
    return this.http.delete<Producto>(`${this.urlEntities}/${id}?table=${params.table}`).pipe(
      catchError((err) => {
        console.error('Error en delete:', err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, body: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.urlEntities}/${id}?table=Producto`, body).pipe(
      catchError((err) => {
        console.error('Error en delete:', err);
        return throwError(() => err);
      })
    );
  }
  /**
   * Obtiene productos paginados desde el servidor.
   *
   * @param {number} [page=1] - Número de página a recuperar (empieza en 1).
   * @param {number} [limit=5] - Cantidad máxima de elementos por página.
   * @param {'asc' | 'desc'} [sortOrder='asc'] - Orden de los resultados: ascendente ('asc') o descendente ('desc').
   * @param {string} [searchTerm=''] - Término de búsqueda para filtrar productos (se ignora si está vacío o espacios).
   * @param {string} [category] - Categoría para filtrar productos (se ignora si es 'all' o undefined).
   * @returns {Observable<PaginatedResponse<Producto>>} Observable que emite la respuesta paginada con los productos.
   */
  getProductosPaginated(
    page = 1,
    limit = 5,
    sortOrder: 'asc' | 'desc' = 'asc',
    searchTerm: string = '',
    category?: string
  ): Observable<PaginatedResponse<Producto>> {
    let params = new HttpParams().set('table', 'Producto').set('page', page).set('limit', limit).set('sortOrder', sortOrder);

    if (searchTerm.trim()) params = params.set('q', searchTerm.trim());

    if (category && category !== 'all') params = params.set('category', category);

    return this.http.get<PaginatedResponse<Producto>>(this.urlPaginated, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.urlCategories}?table=Producto`).pipe(
      catchError((err) => {
        console.error('Error en getCategories:', err);
        return of([]);
      })
    );
  }
}
