import { CartItem } from './cart';

export interface Purchase {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
}
