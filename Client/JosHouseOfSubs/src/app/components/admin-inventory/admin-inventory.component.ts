import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MenuCurrency, MenuItem, MenuItemPayload } from '../../models/menu-item';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-admin-inventory',
  templateUrl: './admin-inventory.component.html',
  styleUrls: ['./admin-inventory.component.css']
})
export class AdminInventoryComponent implements OnInit {
  readonly itemForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    description: this.formBuilder.nonNullable.control('', Validators.maxLength(600)),
    category: this.formBuilder.nonNullable.control('Subs', [Validators.required, Validators.maxLength(60)]),
    price: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    currency: this.formBuilder.nonNullable.control<MenuCurrency>('USD', Validators.required),
    imageUrl: this.formBuilder.nonNullable.control(''),
    stockQuantity: this.formBuilder.control<number | null>(null, Validators.min(0)),
    isAvailable: this.formBuilder.nonNullable.control(true),
    featured: this.formBuilder.nonNullable.control(false),
    sortOrder: this.formBuilder.nonNullable.control(0)
  });

  items: MenuItem[] = [];
  loading = true;
  saving = false;
  deletingId = '';
  editingId: string | null = null;
  errorMessage = '';
  successMessage = '';
  imageError = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly menuService: MenuService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadItems();
  }

  get availableCount(): number {
    return this.items.filter((item) => item.isAvailable && (item.stockQuantity === null || item.stockQuantity === undefined || item.stockQuantity > 0)).length;
  }

  get outOfStockCount(): number {
    return this.items.filter((item) => item.stockQuantity === 0).length;
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.menuService.getAdminItems().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (items) => this.items = items,
      error: (error: HttpErrorResponse) => this.errorMessage = this.getError(error, 'Inventory could not be loaded.')
    });
  }

  editItem(item: MenuItem): void {
    this.editingId = item._id;
    this.successMessage = '';
    this.errorMessage = '';
    this.imageError = '';
    this.itemForm.reset({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      currency: item.currency,
      imageUrl: item.imageUrl,
      stockQuantity: item.stockQuantity ?? null,
      isAvailable: item.isAvailable,
      featured: item.featured,
      sortOrder: item.sortOrder
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.imageError = '';
    this.itemForm.reset({
      name: '',
      description: '',
      category: 'Subs',
      price: 0,
      currency: 'USD',
      imageUrl: '',
      stockQuantity: null,
      isAvailable: true,
      featured: false,
      sortOrder: 0
    });
  }

  saveItem(): void {
    this.itemForm.markAllAsTouched();
    this.errorMessage = '';
    this.successMessage = '';

    if (this.itemForm.invalid || this.saving) {
      return;
    }

    const value = this.itemForm.getRawValue();
    const payload: MenuItemPayload = {
      name: value.name,
      description: value.description,
      category: value.category,
      price: Number(value.price),
      currency: value.currency,
      imageUrl: value.imageUrl,
      stockQuantity: value.stockQuantity === null || value.stockQuantity === undefined
        ? null
        : Number(value.stockQuantity),
      isAvailable: value.isAvailable,
      featured: value.featured,
      sortOrder: Number(value.sortOrder)
    };

    this.saving = true;
    const request = this.editingId
      ? this.menuService.updateItem(this.editingId, payload)
      : this.menuService.createItem(payload);

    request.pipe(finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.successMessage = this.editingId ? 'Menu item updated.' : 'Menu item added.';
        this.cancelEdit();
        this.loadItems();
      },
      error: (error: HttpErrorResponse) => this.errorMessage = this.getError(error, 'The menu item could not be saved.')
    });
  }

  deleteItem(item: MenuItem): void {
    if (!confirm(`Delete "${item.name}" from the menu? This cannot be undone.`)) {
      return;
    }

    this.deletingId = item._id;
    this.errorMessage = '';
    this.menuService.deleteItem(item._id).pipe(
      finalize(() => this.deletingId = '')
    ).subscribe({
      next: () => {
        this.items = this.items.filter((current) => current._id !== item._id);
        this.successMessage = 'Menu item deleted.';
        if (this.editingId === item._id) {
          this.cancelEdit();
        }
      },
      error: (error: HttpErrorResponse) => this.errorMessage = this.getError(error, 'The menu item could not be deleted.')
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError = '';

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.imageError = 'Choose a JPG, PNG, or WebP image.';
      input.value = '';
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      this.imageError = 'Choose an image smaller than 6 MB.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maximumDimension = 1400;
        const scale = Math.min(1, maximumDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');

        if (!context) {
          this.imageError = 'The picture could not be prepared.';
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressedImage = canvas.toDataURL('image/webp', 0.8);

        if (compressedImage.length > 1.5 * 1024 * 1024) {
          this.imageError = 'This picture is still too large after optimization. Choose a smaller image.';
          return;
        }

        this.itemForm.controls.imageUrl.setValue(compressedImage);
      };
      image.onerror = () => this.imageError = 'The image could not be opened.';
      image.src = String(reader.result || '');
    };
    reader.onerror = () => this.imageError = 'The image could not be read.';
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeImage(): void {
    this.itemForm.controls.imageUrl.setValue('');
  }

  formatPrice(item: MenuItem): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: item.currency,
      maximumFractionDigits: item.currency === 'LBP' ? 0 : 2
    }).format(item.price);
  }

  stockLabel(item: MenuItem): string {
    if (item.stockQuantity === null || item.stockQuantity === undefined) {
      return 'Not tracked';
    }

    return item.stockQuantity === 0 ? 'Out of stock' : `${item.stockQuantity} in stock`;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/staff/login']);
  }

  trackById(_index: number, item: MenuItem): string {
    return item._id;
  }

  private getError(error: HttpErrorResponse, fallback: string): string {
    return error.error?.message || fallback;
  }
}