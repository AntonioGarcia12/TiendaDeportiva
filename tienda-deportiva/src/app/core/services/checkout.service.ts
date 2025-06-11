import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { loadStripe, PaymentIntentResult, Stripe, StripeElements } from '@stripe/stripe-js';
import { from, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/payment/create-payment-intent`;
  private readonly stripePromise = loadStripe(environment.stripePublishableKey);

  createPaymentIntent(amountInCents: number) {
    return this.http.post<{ clientSecret: string }>(this.url, { amount: amountInCents });
  }

  /**
   * Inicializa y monta los elementos de Stripe en un contenedor dado.
   *
   * @param {string} clientSecret - Clave secreta del cliente proporcionada por Stripe.
   * @param {HTMLElement} container - Elemento del DOM donde se montará el formulario de pago.
   * @returns {Observable<{ stripe: Stripe; elements: StripeElements }>}
   * Observable que emite el objeto Stripe y los Elements creados.
   */
  mountElements(clientSecret: string, container: HTMLElement): Observable<{ stripe: Stripe; elements: StripeElements }> {
    return from(this.stripePromise).pipe(
      switchMap((stripe) => {
        if (!stripe) throw new Error('Stripe no pudo cargarse');
        const elements = stripe.elements({ clientSecret });
        elements.create('payment').mount(container);
        return of({ stripe, elements });
      })
    );
  }

  confirm(stripe: Stripe, elements: StripeElements): Observable<PaymentIntentResult> {
    return from(stripe.confirmPayment({ elements, confirmParams: {}, redirect: 'if_required' }));
  }
}
