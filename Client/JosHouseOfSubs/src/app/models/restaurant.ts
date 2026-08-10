export interface RestaurantDetails {
  name: string;
  address?: string;
  phone?: string;
  hours?: string[];
  socialLinks?: Record<string, string>;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}
