import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RatingService } from '@app/core/services/rating.service';
import { Producto } from '@app/models/product';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rating',
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './rating.component.html'
})
export class RatingComponent implements OnInit {
  private readonly ratingService = inject(RatingService);
  @Input() product!: Producto;
  ratingsAverage = signal(0);
  ratingsCount = signal(0);

  ngOnInit() {
    if (!this.product) return;
    this.ratingService.list(this.product.id).subscribe({
      next: ({ average, count }) => {
        this.ratingsAverage.set(average);
        this.ratingsCount.set(count);
      },
      error: () => {
        this.ratingsAverage.set(0);
        this.ratingsCount.set(0);
      }
    });
  }
}
