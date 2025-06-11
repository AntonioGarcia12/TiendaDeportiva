import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@app/core/services/cart.service';
import { CheckoutService } from '@app/core/services/checkout.service';
import { PurchaseService } from '@app/core/services/purchase.service';
import { TranslateModule } from '@ngx-translate/core';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { finalize, Observable, switchMap, take, throwError } from 'rxjs';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './checkout.component.html'
})
export default class CheckoutComponent implements OnInit {
  @ViewChild('stripeContainer', { static: true }) stripeContainer!: ElementRef;
  private readonly cartService = inject(CartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly recorderService = inject(PurchaseService);
  private stripeInstance = signal<Stripe | null>(null);
  private elements = signal<StripeElements | null>(null);
  total = this.cartService.total;
  msg = signal('');
  isError = signal(false);
  paid = signal(false);
  loading = signal(false);

  /**
   * Inicializa la instancia de Stripe y monta los Elements en el contenedor.
   *
   * Cuando se inicializa el componente, se crea un nuevo Payment Intent y se montan los Elements en el contenedor.
   * Cuando los Elements se montan, se establecen las señales {@link stripeInstance} y {@link elements}.
   * Si ocurre un error al montar, se registra el error en la consola.
   */
  ngOnInit() {
    this.checkoutService
      .createPaymentIntent(Math.round(this.cartService.total * 100))
      .pipe(switchMap(({ clientSecret }) => this.checkoutService.mountElements(clientSecret, this.stripeContainer.nativeElement)))
      .subscribe({
        next: ({ stripe, elements }) => {
          this.stripeInstance.set(stripe);
          this.elements.set(elements);
        },
        error: (err) => {
          console.error('Error al montar Stripe:', err);
        }
      });
  }

  pay(evt: Event) {
    evt.preventDefault();
    if (this.paid()) return;

    this.loading.set(true);
    this.isError.set(false);
    this.msg.set('');

    const stripeInstance = this.stripeInstance();
    const elementsInstance = this.elements();
    if (!stripeInstance) {
      this.loading.set(false);
      this.isError.set(true);
      this.msg.set('Stripe no está inicializado');
      return;
    }
    if (!elementsInstance) {
      this.loading.set(false);
      this.isError.set(true);
      this.msg.set('Stripe Elements no está inicializado');
      return;
    }

    this.checkoutService
      .confirm(stripeInstance, elementsInstance)
      .pipe(
        take(1),
        switchMap((result) => {
          if (result.error) return throwError(() => result.error!);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return this.cartService.updateStockAfterPurchase() as Observable<any[]>;
        }),
        switchMap(() => {
          return this.recorderService.recordPurchase(this.cartService.items, this.cartService.total);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.paid.set(true);
          this.cartService.clear();
          this.msg.set('¡Compra realizada correctamente!');
        },
        error: (err) => {
          console.error('Error durante el flujo de pago:', err);
          this.isError.set(true);
          this.msg.set(err.message || 'Algo salió mal');
        }
      });
  }
}
