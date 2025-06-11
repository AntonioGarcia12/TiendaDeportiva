import { Producto } from './product';

export interface CartItem extends Producto {
  quantity: number;
  score?: number | null;
  comment?: string | null;
}
