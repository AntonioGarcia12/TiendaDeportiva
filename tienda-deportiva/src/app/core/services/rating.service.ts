import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Rating, RatingResponse, RatingSummary } from '@app/models/rating';
import { environment } from '@env';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/rating/products`;

  list(productId: string): Observable<RatingResponse> {
    return this.http.get<RatingSummary>(`${this.url}/${productId}/ratings`).pipe(
      catchError(() => {
        return of({ ratings: [], average: 0, count: 0 });
      })
    );
  }

  rate(productId: string, score: number, comment = ''): Observable<Rating> {
    return this.http.post<Rating>(`${this.url}/${productId}/rate`, {
      score,
      comment
    });
  }
}
