import { Component, OnInit } from '@angular/core';
import { MenuItem } from '../../models/menu-item';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  items: MenuItem[] = [];
  selectedCategory = 'All';
  loading = true;
  errorMessage = '';

  constructor(private readonly menuService: MenuService) { }

  ngOnInit(): void {
    this.menuService.getPublicItems().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'The menu could not be loaded. Please try again shortly.';
        this.loading = false;
      }
    });
  }

  get categories(): string[] {
    return ['All', ...Array.from(new Set(this.items.map((item) => item.category))).sort()];
  }

  get visibleItems(): MenuItem[] {
    return this.selectedCategory === 'All'
      ? this.items
      : this.items.filter((item) => item.category === this.selectedCategory);
  }

  formatPrice(item: MenuItem): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: item.currency,
      minimumFractionDigits: item.currency === 'LBP' ? 0 : 2,
      maximumFractionDigits: item.currency === 'LBP' ? 0 : 2
    }).format(item.price);
  }

  orderUrl(item: MenuItem): string {
    const message = `Hi Jo's! I'd like to order ${item.name}.`;
    return `https://wa.me/9613596091?text=${encodeURIComponent(message)}`;
  }

  trackById(_index: number, item: MenuItem): string {
    return item._id;
  }
}