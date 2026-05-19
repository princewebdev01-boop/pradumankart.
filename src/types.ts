export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isAssured?: boolean;
  features?: string[];
  sectionId?: string; // ID of the homepage section this product belongs to
  createdAt: any;
  updatedAt: any;
}

export interface Section {
  id: string;
  title: string;
  subtitle?: string;
  type: 'products' | 'banner' | 'categories' | 'featured';
  order: number;
  active: boolean;
  config?: any;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}
