export interface Producto {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: string;
  createdAt: string;
}

export interface NewProducto {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  status: string;
}
