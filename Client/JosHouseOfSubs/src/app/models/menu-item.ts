export type MenuCurrency = 'USD' | 'LBP';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: MenuCurrency;
  imageUrl: string;
  isAvailable: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItemPayload {
  name: string;
  description: string;
  category: string;
  price: number;
  currency: MenuCurrency;
  imageUrl: string;
  isAvailable: boolean;
  featured: boolean;
  sortOrder: number;
}