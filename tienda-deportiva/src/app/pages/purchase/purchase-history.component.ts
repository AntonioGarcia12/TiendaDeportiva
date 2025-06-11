import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchaseService } from '@app/core/services/purchase.service';
import { RatingService } from '@app/core/services/rating.service';
import { Purchase } from '@app/models/purchase';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-purchasehistory',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './purchase-history.component.html'
})
export default class PurchasehistoryComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly ratingService = inject(RatingService);
  private readonly router = inject(Router);
  history = signal<Purchase[]>([]);
  editingItemId = signal<string | null>(null);
  tempRatings: Record<string, number> = {};
  tempComments: Record<string, string> = {};
  showRatedToast = signal(false);

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory(): void {
    this.purchaseService.fetchHistory().subscribe({
      next: (list) => this.history.set(list),
      error: (err) => console.error('No se pudo cargar el historial', err)
    });
  }

  onRate(itemId: string) {
    const score = this.tempRatings[itemId] ?? 0;
    const comment = this.tempComments[itemId] ?? '';

    if (score <= 0) return;

    this.ratingService
      .rate(itemId, score, comment)
      .pipe(switchMap(() => this.purchaseService.fetchHistory()))
      .subscribe({
        next: (updated) => {
          this.history.set(updated);
          delete this.tempRatings[itemId];
          delete this.tempComments[itemId];
          this.editingItemId.set(null);

          this.router.navigate(['/home'], {
            queryParams: { success: 'Producto valorado correctamente' }
          });
        },
        error: (err) => console.error('Error al valorar', err)
      });
  }
}
