import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  MenuCurrency,
  MenuItem,
  MenuItemPayload
} from '../../models/menu-item';

import {
  AuthService
} from '../../services/auth.service';

import {
  MenuService
} from '../../services/menu.service';

@Component({
  selector: 'app-admin-inventory',
  

  template: `
    <main>
      <header>
        <a routerLink="/staff/inventory">
          ← Inventory
        </a>

        <strong>Menu management</strong>

        <nav>
          <a routerLink="/staff/inventory/manage">
            Inventory setup
          </a>

          <a
            routerLink="/menu"
            target="_blank"
          >
            Public menu ↗
          </a>

          <button (click)="logout()">
            Sign out
          </button>
        </nav>
      </header>

      <section class="content">
        <div class="heading">
          <p>Super administrator only</p>

          <h1>
            Menu<br>
            <em>control.</em>
          </h1>
        </div>

        <div
          class="notice error"
          *ngIf="errorMessage"
        >
          {{ errorMessage }}
        </div>

        <div
          class="notice success"
          *ngIf="successMessage"
        >
          {{ successMessage }}
        </div>

        <section class="card">
          <div class="card-heading">
            <div>
              <span>
                {{
                  editingId
                    ? 'Editing item'
                    : 'New item'
                }}
              </span>

              <h2>
                {{
                  editingId
                    ? 'Update menu item'
                    : 'Add menu item'
                }}
              </h2>
            </div>

            <button
              *ngIf="editingId"
              class="secondary"
              (click)="cancelEdit()"
            >
              Cancel
            </button>
          </div>

          <form
            [formGroup]="itemForm"
            (ngSubmit)="saveItem()"
          >
            <div class="form-layout">
              <div class="fields">
                <div class="row">
                  <label>
                    <span>Item name *</span>

                    <input
                      formControlName="name"
                    >
                  </label>

                  <label>
                    <span>Category *</span>
                  
                    <select formControlName="category">
                      <option
                        *ngFor="let category of availableCategories"
                        [value]="category"
                      >
                        {{ category }}
                      </option>
                    </select>
                  </label>
                </div>

                <label>
                  <span>Description</span>

                  <textarea
                    formControlName="description"
                    rows="4"
                  ></textarea>
                </label>

                <div class="row three">
                  <label>
                    <span>Price *</span>

                    <input
                      type="number"
                      formControlName="price"
                      min="0"
                      step="0.01"
                    >
                  </label>

                  <label>
                    <span>Currency</span>

                    <select
                      formControlName="currency"
                    >
                      <option value="USD">
                        USD
                      </option>

                      <option value="LBP">
                        LBP
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Display order</span>

                    <input
                      type="number"
                      formControlName="sortOrder"
                    >
                  </label>
                </div>

                <div class="row">
                  <label class="check">
                    <input
                      type="checkbox"
                      formControlName="isAvailable"
                    >

                    <span>
                      Visible on public menu
                    </span>
                  </label>

                  <label class="check">
                    <input
                      type="checkbox"
                      formControlName="featured"
                    >

                    <span>Featured</span>
                  </label>
                </div>
              </div>

              <div class="image">
                <span>Item picture</span>

                <div class="preview">
                  <img
                    *ngIf="
                      itemForm.controls.imageUrl.value
                    "
                    [src]="
                      itemForm.controls.imageUrl.value
                    "
                    alt="Menu item"
                  >

                  <b
                    *ngIf="
                      !itemForm.controls.imageUrl.value
                    "
                  >
                    JO'S
                  </b>
                </div>

                <label class="upload">
                  Choose picture

                  <input
                    type="file"
                    accept="
                      image/jpeg,
                      image/png,
                      image/webp
                    "
                    (change)="
                      onImageSelected($event)
                    "
                  >
                </label>

                <button
                  type="button"
                  *ngIf="
                    itemForm.controls.imageUrl.value
                  "
                  (click)="
                    itemForm.controls.imageUrl
                      .setValue('')
                  "
                >
                  Remove picture
                </button>

                <small
                  class="error-text"
                  *ngIf="imageError"
                >
                  {{ imageError }}
                </small>
              </div>
            </div>

            <button
              class="primary"
              type="submit"
              [disabled]="saving"
            >
              {{
                saving
                  ? 'Saving…'
                  : (
                      editingId
                        ? 'Save changes'
                        : 'Add menu item'
                    )
              }}
            </button>
          </form>
        </section>

        <section class="card">
          <div class="card-heading">
            <div>
              <span>Current menu</span>
              <h2>Items &amp; prices</h2>
            </div>

            <button
              class="secondary"
              (click)="load()"
            >
              Refresh
            </button>
          </div>
<div class="menu-filters">
  <label>
    <span>Search by name</span>

    <input
      type="search"
      [(ngModel)]="searchText"
      [ngModelOptions]="{ standalone: true }"
      placeholder="Search menu items"
    >
  </label>

  <label>
    <span>Filter by category</span>

    <select
      [(ngModel)]="categoryFilter"
      [ngModelOptions]="{ standalone: true }"
    >
      <option value="">All categories</option>

      <option
        *ngFor="let category of availableCategories"
        [value]="category"
      >
        {{ category }}
      </option>
    </select>
  </label>

  <button
    type="button"
    class="clear-filters"
    (click)="clearFilters()"
    [disabled]="!searchText && !categoryFilter"
  >
    Clear filters
  </button>
</div>
<div
  class="empty"
  *ngIf="!loading && filteredItems.length === 0"
>
  {{
    items.length === 0
      ? 'No menu items.'
      : 'No menu items match your filters.'
  }}
</div>

          <div class="items">
            <article
              *ngFor="let item of filteredItems"
              [class.hidden]="
                !item.isAvailable
              "
            >
              <div class="thumb">
                <img
                  *ngIf="item.imageUrl"
                  [src]="item.imageUrl"
                  [alt]="item.name"
                >

                <span *ngIf="!item.imageUrl">
                  JO'S
                </span>
              </div>

              <div class="copy">
                <small>
                  {{ item.category }}
                </small>

                <h3>{{ item.name }}</h3>

                <p>
                  {{
                    item.description ||
                    'No description.'
                  }}
                </p>
              </div>

              <strong>
                {{ formatPrice(item) }}
              </strong>

              <span>
                {{
                  item.isAvailable
                    ? 'Visible'
                    : 'Hidden'
                }}
              </span>

              <div class="actions">
                <button
                  (click)="editItem(item)"
                >
                  Edit
                </button>

                <button
                  class="danger"
                  (click)="deleteItem(item)"
                >
                  Delete
                </button>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  `,

  styles: [`
    :host {
      display: block;
    }

    main {
      min-height: 100svh;
      background: #f3f0ea;
    }

    header {
      min-height: 82px;
      padding: 10px clamp(18px, 4vw, 60px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 22px;
      background: #fff;
      border-bottom: 3px solid var(--ink);
    }
      .menu-filters {
  margin-top: 22px;
  padding: 18px;
  display: grid;
  grid-template-columns:
    minmax(220px, 1fr)
    minmax(190px, .55fr)
    auto;
  align-items: end;
  gap: 14px;
  background: var(--cream);
  border: 2px solid var(--ink);
}

.menu-filters .clear-filters {
  min-height: 47px;
  padding: 0 16px;
  background: var(--ink);
  color: white;
  border: 2px solid var(--ink);
  cursor: pointer;
  font-size: .58rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.menu-filters .clear-filters:disabled {
  opacity: .45;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .menu-filters {
    grid-template-columns: 1fr 1fr;
  }

  .menu-filters .clear-filters {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .menu-filters {
    grid-template-columns: 1fr;
  }

  .menu-filters .clear-filters {
    grid-column: auto;
  }
}

    header > a,
    header strong,
    nav a,
    nav button {
      text-transform: uppercase;
      font-size: .62rem;
      font-weight: 900;
      letter-spacing: .08em;
    }

    nav {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    nav button {
      padding: 10px 13px;
      background: var(--ink);
      color: #fff;
      border: 0;
    }

    .content {
      max-width: 1400px;
      margin: auto;
      padding:
        55px
        clamp(18px, 5vw, 70px)
        90px;
    }

    .heading p {
      color: var(--pink);
      font-size: .65rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .14em;
    }

    .heading h1 {
      margin: 0 0 35px;
      font-family: var(--font-display);
      font-size: clamp(3rem, 6vw, 6rem);
      line-height: .9;
      text-transform: uppercase;
    }

    .heading em {
      color: var(--pink);
      font-style: normal;
    }

    .card {
      margin-top: 30px;
      padding: clamp(22px, 4vw, 45px);
      background: #fff;
      border: 3px solid var(--ink);
      box-shadow: 7px 7px var(--ink);
    }

    .card-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--ink);
    }

    .card-heading span,
    label > span,
    .image > span {
      color: var(--pink);
      font-size: .58rem;
      font-weight: 900;
      text-transform: uppercase;
    }

    .card-heading h2 {
      margin: 6px 0 0;
      font-family: var(--font-display);
      font-size:
        clamp(1.7rem, 3vw, 2.8rem);
      text-transform: uppercase;
    }

    .form-layout {
      margin-top: 24px;
      display: grid;
      grid-template-columns:
        1fr 280px;
      gap: 28px;
    }

    .fields {
      display: grid;
      gap: 16px;
    }

    .row {
      display: grid;
      grid-template-columns:
        1.5fr 1fr;
      gap: 16px;
    }

    .row.three {
      grid-template-columns:
        repeat(3, 1fr);
    }

    label {
      display: grid;
      gap: 7px;
    }

    input:not([type="checkbox"]),
    textarea,
    select {
      width: 100%;
      min-height: 47px;
      padding: 10px;
      background: var(--cream);
      border: 2px solid var(--ink);
    }

    textarea {
      resize: vertical;
    }

    .check {
      padding: 12px;
      display: flex;
      align-items: center;
      background: var(--cream);
      border: 2px solid var(--ink);
    }

    .check input {
      width: 18px;
      height: 18px;
    }

    .image {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .preview {
      height: 210px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background: var(--pink);
      border: 3px solid var(--ink);
    }

    .preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview b {
      color: #fff;
      font-family: var(--font-display);
      font-size: 2rem;
    }

    .upload,
    .image button,
    .secondary,
    .actions button {
      padding: 10px;
      background: #fff;
      border: 2px solid var(--ink);
      font-size: .58rem;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
      cursor: pointer;
    }

    .upload {
      background: var(--pink);
      color: #fff;
    }

    .upload input {
      display: none;
    }

    .primary {
      margin-top: 20px;
      min-height: 50px;
      padding: 0 20px;
      background: var(--pink);
      color: #fff;
      border: 3px solid var(--ink);
      font-size: .6rem;
      font-weight: 900;
      text-transform: uppercase;
    }

    .items {
      display: grid;
      gap: 12px;
      margin-top: 20px;
    }

    .items article {
      padding: 14px;
      display: grid;
      grid-template-columns:
        100px
        minmax(200px, 1fr)
        120px
        90px
        140px;
      align-items: center;
      gap: 16px;
      background: var(--cream);
      border: 2px solid var(--ink);
    }

    .items article.hidden {
      opacity: .65;
    }

    .thumb {
      width: 100px;
      height: 85px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background: var(--pink);
    }

    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb span {
      color: #fff;
      font-family: var(--font-display);
    }

    .copy small {
      color: #666;
      text-transform: uppercase;
    }

    .copy h3 {
      margin: 5px 0;
      font-family: var(--font-display);
      text-transform: uppercase;
    }

    .copy p {
      margin: 0;
      color: #666;
      font-size: .75rem;
    }

    .actions {
      display: grid;
      gap: 7px;
    }

    .actions .danger {
      color: #a00000;
      border-color: #a00000;
    }

    .notice,
    .empty {
      margin: 16px 0;
      padding: 15px;
      background: #fff;
      border: 2px solid var(--ink);
    }

    .notice.error {
      border-left: 7px solid #c50000;
    }

    .notice.success {
      border-left: 7px solid #188841;
    }

    .error-text {
      color: #a00000;
    }

    @media (max-width: 900px) {
      header,
      .card-heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .form-layout {
        grid-template-columns: 1fr;
      }

      .image {
        max-width: 350px;
      }

      .items article {
        grid-template-columns:
          90px 1fr;
      }

      .copy {
        grid-column: 2;
      }

      .actions {
        grid-column: 1 / -1;
        display: flex;
      }
    }

    @media (max-width: 600px) {
      .row,
      .row.three {
        grid-template-columns: 1fr;
      }

      .items article {
        grid-template-columns: 1fr;
      }

      .copy,
      .actions {
        grid-column: auto;
      }

      .thumb {
        width: 100%;
      }
    }
  `]
})
export class AdminInventoryComponent
  implements OnInit {

items: MenuItem[] = [];

readonly defaultCategories = [
  'Appetizers',
  'Beverages',
  'Burgers',
  'Cold Cuts',
  'Kabab Corner',
  'Pasta',
  'Salads',
  'Subs'
];

searchText = '';
categoryFilter = '';

editingId: string | null = null;

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';
  imageError = '';

  readonly itemForm =
    this.formBuilder.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(120)
        ]
      ],

      description: [
        '',
        Validators.maxLength(600)
      ],

      category: [
        'Subs',
        Validators.required
      ],

      price: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      currency:
        this.formBuilder
          .nonNullable
          .control<MenuCurrency>('USD'),

      imageUrl: [''],
      isAvailable: [true],
      featured: [false],
      sortOrder: [0]
    });
      get availableCategories(): string[] {
    const existingCategories = this.items
      .map((item) => item.category.trim())
      .filter(Boolean);

    return Array.from(
      new Set([
        ...this.defaultCategories,
        ...existingCategories
      ])
    ).sort((a, b) => a.localeCompare(b));
  }

  get filteredItems(): MenuItem[] {
    const search = this.searchText
      .trim()
      .toLowerCase();

    return this.items.filter((item) => {
      const nameMatches =
        !search ||
        item.name.toLowerCase().includes(search);

      const categoryMatches =
        !this.categoryFilter ||
        item.category === this.categoryFilter;

      return nameMatches && categoryMatches;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.categoryFilter = '';
  }

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly menuService:
      MenuService,

    private readonly authService:
      AuthService,

    private readonly router:
      Router
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.menuService
      .getAdminItems()
      .pipe(
        finalize(
          () => this.loading = false
        )
      )
      .subscribe({
        next: (items) => {
          this.items = items;
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            error.error?.message ||
            'Menu could not be loaded.';
        }
      });
  }

  editItem(item: MenuItem): void {
    this.editingId = item._id;

    this.itemForm.reset({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      currency: item.currency,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      featured: item.featured,
      sortOrder: item.sortOrder
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelEdit(): void {
    this.editingId = null;

    this.itemForm.reset({
      name: '',
      description: '',
      category: 'Subs',
      price: 0,
      currency: 'USD',
      imageUrl: '',
      isAvailable: true,
      featured: false,
      sortOrder: 0
    });
  }

  saveItem(): void {
    this.itemForm.markAllAsTouched();

    if (
      this.itemForm.invalid ||
      this.saving
    ) {
      return;
    }

    const value =
      this.itemForm.getRawValue();

    const payload: MenuItemPayload = {
      ...value,
      price: Number(value.price),
      sortOrder: Number(value.sortOrder)
    };

    this.saving = true;

    const request = this.editingId
      ? this.menuService.updateItem(
          this.editingId,
          payload
        )
      : this.menuService.createItem(
          payload
        );

    request
      .pipe(
        finalize(
          () => this.saving = false
        )
      )
      .subscribe({
        next: () => {
          this.successMessage =
            this.editingId
              ? 'Menu item updated.'
              : 'Menu item added.';

          this.cancelEdit();
          this.load();
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            error.error?.message ||
            'Menu item could not be saved.';
        }
      });
  }

  deleteItem(item: MenuItem): void {
    if (
      !confirm(
        `Delete "${item.name}"?`
      )
    ) {
      return;
    }

    this.menuService
      .deleteItem(item._id)
      .subscribe({
        next: () => {
          this.items =
            this.items.filter(
              (current) =>
                current._id !== item._id
            );

          this.successMessage =
            'Menu item deleted.';
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            error.error?.message ||
            'Menu item could not be deleted.';
        }
      });
  }

  onImageSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    this.imageError = '';

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (
      !allowedTypes.includes(file.type) ||
      file.size > 6 * 1024 * 1024
    ) {
      this.imageError =
        'Choose a JPG, PNG, or WebP image smaller than 6 MB.';
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(
          1,
          1400 / Math.max(
            image.width,
            image.height
          )
        );

        const canvas =
          document.createElement('canvas');

        canvas.width = Math.max(
          1,
          Math.round(image.width * scale)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * scale)
        );

        const context =
          canvas.getContext('2d');

        if (!context) {
          this.imageError =
            'The image could not be prepared.';
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const data =
          canvas.toDataURL(
            'image/webp',
            .8
          );

        if (
          data.length >
          1.5 * 1024 * 1024
        ) {
          this.imageError =
            'Optimized image is still too large.';
          return;
        }

        this.itemForm.controls.imageUrl
          .setValue(data);
      };

      image.onerror = () => {
        this.imageError =
          'The image could not be opened.';
      };

      image.src =
        String(reader.result || '');
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  formatPrice(item: MenuItem): string {
    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency: item.currency,
        maximumFractionDigits:
          item.currency === 'LBP'
            ? 0
            : 2
      }
    ).format(item.price);
  }

  logout(): void {
    this.authService.logout();

    void this.router.navigate([
      '/staff/login'
    ]);
  }
}