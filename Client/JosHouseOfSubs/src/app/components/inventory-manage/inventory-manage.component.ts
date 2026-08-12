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
  finalize,
  forkJoin
} from 'rxjs';

import {
  InventoryCategory,
  RawMaterial,
  RawMaterialPayload
} from '../../models/raw-material';

import {
  AuthService
} from '../../services/auth.service';

import {
  RawMaterialService
} from '../../services/raw-material.service';

@Component({
  selector: 'app-inventory-manage',

  template: `
    <main>
      <header>
        <a routerLink="/staff/inventory">
          ← Inventory view
        </a>

        <strong>Super-admin setup</strong>

        <nav>
          <a routerLink="/staff/menu">
            Manage menu
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
            Inventory<br>
            <em>setup.</em>
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

        <section class="card categories">
          <div class="card-heading">
            <div>
              <span>Organization</span>
              <h2>Categories</h2>
            </div>
          </div>

          <form
            class="category-form"
            [formGroup]="categoryForm"
            (ngSubmit)="addCategory()"
          >
            <label>
              <span>New category name</span>

              <input
                formControlName="name"
                placeholder="Meats, Bread, Vegetables..."
              >
            </label>

            <label>
              <span>Display order</span>

              <input
                type="number"
                formControlName="sortOrder"
              >
            </label>

            <button
              type="submit"
              [disabled]="categorySaving"
            >
              Add category
            </button>
          </form>

          <div class="category-list">
            <div
              *ngFor="let category of categories"
            >
              <strong>{{ category.name }}</strong>

              <small>
                Order {{ category.sortOrder }}
              </small>

              <button
                (click)="renameCategory(category)"
              >
                Rename
              </button>

              <button
                class="danger"
                (click)="deleteCategory(category)"
              >
                Delete
              </button>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-heading">
            <div>
              <span>
                {{
                  editingId
                    ? 'Edit item'
                    : 'New inventory item'
                }}
              </span>

              <h2>
                {{
                  editingId
                    ? 'Update item details'
                    : 'Add inventory item'
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

          <p
            class="help"
            *ngIf="editingId"
          >
            Use the Inventory View page for
            quantity changes so the employee
            name and movement are recorded.
          </p>

          <form
            [formGroup]="itemForm"
            (ngSubmit)="saveItem()"
          >
            <div class="grid">
              <label>
                <span>Item name *</span>

                <input
                  formControlName="name"
                  placeholder="Chicken breast"
                >
              </label>

              <label>
                <span>Category *</span>

                <select formControlName="categoryId">
                  <option value="">
                    Choose category
                  </option>

                  <option
                    *ngFor="let category of categories"
                    [value]="category._id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </label>

              <label>
                <span>
                  {{
                    editingId
                      ? 'Current quantity'
                      : 'Initial quantity'
                  }}
                  *
                </span>

                <input
                  type="number"
                  formControlName="quantity"
                  min="0"
                  step="any"
                  [readonly]="!!editingId"
                >
              </label>

              <label>
                <span>Unit *</span>

                <input
                  formControlName="unit"
                  list="units"
                  placeholder="kg"
                >

                <datalist id="units">
                  <option value="kg"></option>
                  <option value="g"></option>
                  <option value="L"></option>
                  <option value="ml"></option>
                  <option value="pieces"></option>
                  <option value="bags"></option>
                  <option value="boxes"></option>
                </datalist>
              </label>

              <label>
                <span>Low-stock warning at</span>

                <input
                  type="number"
                  formControlName="minimumQuantity"
                  min="0"
                  step="any"
                >
              </label>

              <label class="notes">
                <span>Notes</span>

                <textarea
                  formControlName="notes"
                  rows="3"
                  placeholder="Supplier, brand, storage location..."
                ></textarea>
              </label>
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
                        ? 'Save details'
                        : 'Add inventory item'
                    )
              }}
            </button>
          </form>
        </section>

        <section class="card">
          <div class="card-heading">
            <div>
              <span>All inventory items</span>
              <h2>Manage items</h2>
            </div>

            <input
              class="search"
              type="search"
              [(ngModel)]="searchText"
              [ngModelOptions]="{
                standalone: true
              }"
              placeholder="Search items"
            >
          </div>

          <div
            class="empty"
            *ngIf="
              !loading &&
              filteredItems.length === 0
            "
          >
            No matching items.
          </div>

          <div class="items">
            <article
              *ngFor="let item of filteredItems"
            >
              <div>
                <span>
                  {{
                    item.category?.name ||
                    'Uncategorized'
                  }}
                </span>

                <h3>{{ item.name }}</h3>

                <p>
                  {{ item.quantity }}
                  {{ item.unit }}
                  · Low at
                  {{ item.minimumQuantity }}
                  {{ item.unit }}
                </p>
              </div>

              <div class="item-actions">
                <button
                  (click)="editItem(item)"
                >
                  Edit details
                </button>

                <button
                  class="danger"
                  (click)="deleteItem(item)"
                >
                  Delete whole item
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
    label span {
      color: var(--pink);
      font-size: .58rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .09em;
    }

    .card-heading h2 {
      margin: 6px 0 0;
      font-family: var(--font-display);
      font-size: clamp(1.7rem, 3vw, 2.8rem);
      text-transform: uppercase;
    }

    .category-form {
      margin-top: 22px;
      display: grid;
      grid-template-columns:
        1fr 170px auto;
      align-items: flex-end;
      gap: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns:
        repeat(5, 1fr);
      gap: 16px;
    }

    .notes {
      grid-column: 1 / -1;
    }

    label {
      display: grid;
      gap: 7px;
    }

    input,
    select,
    textarea {
      width: 100%;
      min-height: 47px;
      padding: 10px 12px;
      background: var(--cream);
      border: 2px solid var(--ink);
    }

    input[readonly] {
      opacity: .65;
      cursor: not-allowed;
    }

    textarea {
      resize: vertical;
    }

    form > .primary,
    .category-form button {
      min-height: 48px;
      padding: 0 18px;
      background: var(--pink);
      color: #fff;
      border: 2px solid var(--ink);
      font-size: .6rem;
      font-weight: 900;
      text-transform: uppercase;
      cursor: pointer;
    }

    form > .primary {
      margin-top: 20px;
    }

    .secondary,
    .category-list button,
    .item-actions button {
      padding: 9px 12px;
      background: #fff;
      border: 2px solid var(--ink);
      font-size: .56rem;
      font-weight: 900;
      text-transform: uppercase;
      cursor: pointer;
    }

    .danger {
      color: #a00000 !important;
      border-color: #a00000 !important;
    }

    .category-list {
      margin-top: 18px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .category-list > div {
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--cream);
      border: 2px solid var(--ink);
    }

    .category-list small {
      color: #666;
    }

    .help {
      padding: 12px;
      background: #fff3ce;
      border-left: 6px solid #c68a00;
    }

    .search {
      max-width: 300px;
    }

    .items {
      display: grid;
      gap: 12px;
      margin-top: 20px;
    }

    .items article {
      padding: 17px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      background: var(--cream);
      border: 2px solid var(--ink);
    }

    .items article span {
      color: #666;
      font-size: .56rem;
      font-weight: 900;
      text-transform: uppercase;
    }

    .items h3 {
      margin: 5px 0;
      font-family: var(--font-display);
      font-size: 1.3rem;
      text-transform: uppercase;
    }

    .items p {
      margin: 0;
      color: #666;
    }

    .item-actions {
      display: flex;
      gap: 8px;
    }

    .notice,
    .empty {
      margin: 16px 0;
      padding: 15px;
      background: #fff;
      border: 2px solid var(--ink);
      font-weight: 700;
    }

    .notice.error {
      border-left: 7px solid #c50000;
    }

    .notice.success {
      border-left: 7px solid #188841;
    }

    @media (max-width: 1050px) {
      .grid {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .notes {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 700px) {
      header,
      .card-heading,
      .items article {
        align-items: flex-start;
        flex-direction: column;
      }

      .category-form,
      .grid {
        grid-template-columns: 1fr;
      }

      .notes {
        grid-column: auto;
      }

      .item-actions {
        width: 100%;
        display: grid;
      }

      .search {
        max-width: 100%;
      }
    }
  `]
})
export class InventoryManageComponent
  implements OnInit {

  items: RawMaterial[] = [];
  categories: InventoryCategory[] = [];

  editingId: string | null = null;
  searchText = '';

  loading = true;
  saving = false;
  categorySaving = false;

  errorMessage = '';
  successMessage = '';

  readonly categoryForm =
    this.formBuilder.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(80)
        ]
      ],

      sortOrder: [0]
    });

  readonly itemForm =
    this.formBuilder.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(120)
        ]
      ],

      categoryId: [
        '',
        Validators.required
      ],

      quantity: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      unit: [
        'kg',
        [
          Validators.required,
          Validators.maxLength(30)
        ]
      ],

      minimumQuantity: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      notes: [
        '',
        Validators.maxLength(500)
      ]
    });

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly inventoryService:
      RawMaterialService,

    private readonly authService:
      AuthService,

    private readonly router:
      Router
  ) { }

  ngOnInit(): void {
    this.load();
  }

  get filteredItems(): RawMaterial[] {
    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.items.filter(
      (item) => {
        const text =
          `${item.name} ` +
          `${item.category?.name || ''}`;

        return (
          !search ||
          text
            .toLowerCase()
            .includes(search)
        );
      }
    );
  }

  load(): void {
    this.loading = true;

    forkJoin({
      items:
        this.inventoryService
          .getMaterials(),

      categories:
        this.inventoryService
          .getCategories()
    })
      .pipe(
        finalize(
          () => this.loading = false
        )
      )
      .subscribe({
        next: ({
          items,
          categories
        }) => {
          this.items = items;
          this.categories = categories;
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Inventory setup could not be loaded.'
            );
        }
      });
  }

  addCategory(): void {
    this.categoryForm.markAllAsTouched();

    if (
      this.categoryForm.invalid ||
      this.categorySaving
    ) {
      return;
    }

    const value =
      this.categoryForm.getRawValue();

    this.categorySaving = true;

    this.inventoryService
      .createCategory(
        value.name,
        Number(value.sortOrder)
      )
      .pipe(
        finalize(
          () => this.categorySaving = false
        )
      )
      .subscribe({
        next: (category) => {
          this.categories = [
            ...this.categories,
            category
          ].sort(
            (a, b) =>
              a.sortOrder - b.sortOrder ||
              a.name.localeCompare(b.name)
          );

          this.categoryForm.reset({
            name: '',
            sortOrder: 0
          });

          this.successMessage =
            'Category added.';
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Category could not be added.'
            );
        }
      });
  }

  renameCategory(
    category: InventoryCategory
  ): void {
    const name = prompt(
      'New category name:',
      category.name
    )?.trim();

    if (
      !name ||
      name === category.name
    ) {
      return;
    }

    this.inventoryService
      .updateCategory(
        category._id,
        name,
        category.sortOrder
      )
      .subscribe({
        next: (updated) => {
          this.categories =
            this.categories.map(
              (item) =>
                item._id === updated._id
                  ? updated
                  : item
            );

          this.successMessage =
            'Category renamed.';
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Category could not be renamed.'
            );
        }
      });
  }

  deleteCategory(
    category: InventoryCategory
  ): void {
    if (
      !confirm(
        `Delete category "${category.name}"?`
      )
    ) {
      return;
    }

    this.inventoryService
      .deleteCategory(category._id)
      .subscribe({
        next: () => {
          this.categories =
            this.categories.filter(
              (item) =>
                item._id !== category._id
            );

          this.successMessage =
            'Category deleted.';
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Category could not be deleted.'
            );
        }
      });
  }

  editItem(item: RawMaterial): void {
    this.editingId = item._id;

    this.itemForm.reset({
      name: item.name,
      categoryId:
        item.category?._id || '',
      quantity: item.quantity,
      unit: item.unit,
      minimumQuantity:
        item.minimumQuantity,
      notes: item.notes
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
      categoryId: '',
      quantity: 0,
      unit: 'kg',
      minimumQuantity: 0,
      notes: ''
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

    const payload:
      RawMaterialPayload = {
        name: value.name,
        categoryId:
          value.categoryId,
        quantity:
          Number(value.quantity),
        unit: value.unit,
        minimumQuantity:
          Number(value.minimumQuantity),
        notes: value.notes
      };

    this.saving = true;

    const request = this.editingId
      ? this.inventoryService
          .updateMaterial(
            this.editingId,
            payload
          )
      : this.inventoryService
          .createMaterial(payload);

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
              ? 'Item details updated.'
              : 'Inventory item added.';

          this.cancelEdit();
          this.load();
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Inventory item could not be saved.'
            );
        }
      });
  }

  deleteItem(item: RawMaterial): void {
    if (
      !confirm(
        `Permanently delete "${item.name}" from inventory? Its existing history will remain.`
      )
    ) {
      return;
    }

    this.inventoryService
      .deleteMaterial(item._id)
      .subscribe({
        next: () => {
          this.items =
            this.items.filter(
              (current) =>
                current._id !== item._id
            );

          this.successMessage =
            'Inventory item deleted.';
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Inventory item could not be deleted.'
            );
        }
      });
  }

  logout(): void {
    this.authService.logout();

    void this.router.navigate([
      '/staff/login'
    ]);
  }

  private message(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    return (
      error.error?.message ||
      fallback
    );
  }
}