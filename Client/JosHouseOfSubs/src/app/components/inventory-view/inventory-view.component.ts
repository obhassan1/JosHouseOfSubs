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
  InventoryCategory,
  RawMaterial
} from '../../models/raw-material';

import {
  AuthService
} from '../../services/auth.service';

import {
  RawMaterialService
} from '../../services/raw-material.service';

@Component({
  selector: 'app-inventory-view',

  template: `
    <main class="staff-page">
      <header>
        <a routerLink="/" class="brand">
          <img
            src="assets/images/jos-logo.jpeg"
            alt="Jo's"
          >
          <span>Inventory</span>
        </a>

        <nav>
          <a routerLink="/staff/inventory/history">
            History
          </a>

          <a
            *ngIf="isSuperAdmin"
            routerLink="/staff/inventory/manage"
          >
            Manage inventory
          </a>

          <a
            *ngIf="isSuperAdmin"
            routerLink="/staff/menu"
          >
            Manage menu
          </a>

          <button
            type="button"
            (click)="logout()"
          >
            Sign out
          </button>
        </nav>
      </header>

      <section class="content">
        <div class="heading">
          <div>
            <p>Staff stock control</p>

            <h1>
              Raw-material<br>
              <em>inventory.</em>
            </h1>
          </div>

          <div class="stats">
            <strong>{{ materials.length }}</strong>
            <span>Items</span>

            <strong>{{ lowStockCount }}</strong>
            <span>Low stock</span>
          </div>
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

        <div class="filters">
          <label>
            <span>Search inventory</span>

            <input
              type="search"
              [(ngModel)]="searchText"
              placeholder="Search by item or category"
            >
          </label>

          <label>
            <span>Category</span>

            <select [(ngModel)]="categoryFilter">
              <option value="">
                All categories
              </option>

              <option
                *ngFor="let category of categories"
                [value]="category._id"
              >
                {{ category.name }}
              </option>
            </select>
          </label>

          <button
            type="button"
            (click)="load()"
            [disabled]="loading"
          >
            {{ loading ? 'Loading…' : 'Refresh' }}
          </button>
        </div>

        <div
          class="empty"
          *ngIf="
            !loading &&
            filteredMaterials.length === 0
          "
        >
          No matching inventory items.
        </div>

        <div class="items">
          <article
            *ngFor="
              let material of filteredMaterials
            "
            [class.low]="isLowStock(material)"
          >
            <div class="copy">
              <span>
                {{
                  material.category?.name ||
                  'Uncategorized'
                }}
              </span>

              <h2>{{ material.name }}</h2>

              <p>
                {{
                  material.notes ||
                  'No notes.'
                }}
              </p>
            </div>

            <div class="quantity">
              <span>Current stock</span>

              <strong>
                {{ material.quantity }}
                {{ material.unit }}
              </strong>

              <small
                *ngIf="isLowStock(material)"
              >
                Low stock
              </small>
            </div>

            <div class="actions">
              <button
                type="button"
                class="add"
                (click)="
                  openAdjustment(
                    material,
                    'add'
                  )
                "
              >
                + Add quantity
              </button>

              <button
                type="button"
                class="remove"
                (click)="
                  openAdjustment(
                    material,
                    'remove'
                  )
                "
              >
                − Remove quantity
              </button>
            </div>
          </article>
        </div>
      </section>

      <div
        class="modal-backdrop"
        *ngIf="selectedMaterial"
        (click)="closeAdjustment()"
      ></div>

      <section
        class="modal"
        *ngIf="selectedMaterial"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-heading">
          <div>
            <span>
              {{
                adjustmentType === 'add'
                  ? 'Add stock'
                  : 'Remove stock'
              }}
            </span>

            <h2>
              {{ selectedMaterial.name }}
            </h2>
          </div>

          <button
            type="button"
            (click)="closeAdjustment()"
          >
            ×
          </button>
        </div>

        <p>
          Current quantity:

          <strong>
            {{ selectedMaterial.quantity }}
            {{ selectedMaterial.unit }}
          </strong>
        </p>

        <form
          [formGroup]="adjustmentForm"
          (ngSubmit)="submitAdjustment()"
        >
          <label>
            <span>
              Quantity
              ({{ selectedMaterial.unit }}) *
            </span>

            <input
              type="number"
              formControlName="quantity"
              min="0.000001"
              step="any"
            >
          </label>

          <label>
            <span>Employee name *</span>

            <input
              type="text"
              formControlName="employeeName"
              placeholder="Full name"
            >
          </label>

          <label>
            <span>Reason or note</span>

            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Optional"
            ></textarea>
          </label>

          <div class="modal-actions">
            <button
              type="button"
              class="cancel"
              (click)="closeAdjustment()"
            >
              Cancel
            </button>

            <button
              type="submit"
              [disabled]="saving"
            >
              {{
                saving
                  ? 'Saving…'
                  : 'Confirm change'
              }}
            </button>
          </div>
        </form>
      </section>
    </main>
  `,

  styles: [`
    :host {
      display: block;
    }

    .staff-page {
      min-height: 100svh;
      background: #f3f0ea;
    }

    header {
      min-height: 88px;
      padding: 10px clamp(18px, 4vw, 60px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 25px;
      background: #fff;
      border-bottom: 3px solid var(--ink);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand img {
      width: 105px;
      height: 62px;
      object-fit: contain;
    }

    .brand span,
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
      flex-wrap: wrap;
    }

    nav button {
      padding: 10px 13px;
      border: 0;
      background: var(--ink);
      color: #fff;
      cursor: pointer;
    }

    .content {
      max-width: 1450px;
      margin: auto;
      padding:
        55px
        clamp(18px, 5vw, 70px)
        90px;
    }

    .heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 35px;
    }

    .heading p {
      color: var(--pink);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .14em;
      font-size: .65rem;
    }

    .heading h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(3rem, 6vw, 6rem);
      line-height: .9;
      text-transform: uppercase;
    }

    .heading em {
      color: var(--pink);
      font-style: normal;
    }

    .stats {
      padding: 22px;
      display: grid;
      grid-template-columns: auto auto;
      gap: 8px 14px;
      background: #fff;
      border: 3px solid var(--ink);
      box-shadow: 6px 6px var(--ink);
    }

    .stats strong {
      color: var(--pink);
      font-family: var(--font-display);
      font-size: 2rem;
    }

    .stats span {
      align-self: center;
      text-transform: uppercase;
      font-weight: 900;
      font-size: .58rem;
    }

    .filters {
      margin: 38px 0 24px;
      padding: 20px;
      display: grid;
      grid-template-columns:
        1fr 260px auto;
      align-items: flex-end;
      gap: 15px;
      background: #fff;
      border: 3px solid var(--ink);
    }

    label {
      display: grid;
      gap: 7px;
    }

    label span {
      font-size: .58rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .09em;
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

    textarea {
      resize: vertical;
    }

    .filters button,
    .modal-actions button {
      min-height: 47px;
      padding: 0 18px;
      background: var(--pink);
      color: #fff;
      border: 2px solid var(--ink);
      font-weight: 900;
      text-transform: uppercase;
      font-size: .6rem;
      cursor: pointer;
    }

    .items {
      display: grid;
      gap: 15px;
    }

    .items article {
      padding: 22px;
      display: grid;
      grid-template-columns:
        minmax(220px, 1fr)
        190px
        300px;
      align-items: center;
      gap: 25px;
      background: #fff;
      border: 3px solid var(--ink);
      box-shadow: 5px 5px var(--ink);
    }

    .items article.low {
      border-left: 10px solid #c50000;
    }

    .copy > span,
    .quantity > span {
      color: #666;
      font-size: .56rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .09em;
    }

    .copy h2 {
      margin: 7px 0;
      font-family: var(--font-display);
      font-size: 1.5rem;
      text-transform: uppercase;
    }

    .copy p {
      margin: 0;
      color: #666;
      font-size: .78rem;
    }

    .quantity {
      display: grid;
      gap: 6px;
    }

    .quantity strong {
      font-size: 1.2rem;
    }

    .quantity small {
      color: #b00000;
      font-weight: 900;
      text-transform: uppercase;
    }

    .actions {
      display: flex;
      gap: 9px;
    }

    .actions button {
      flex: 1;
      padding: 12px 10px;
      border: 2px solid var(--ink);
      font-size: .58rem;
      font-weight: 900;
      text-transform: uppercase;
      cursor: pointer;
    }

    .actions .add {
      background: var(--pink);
      color: #fff;
    }

    .actions .remove {
      background: #fff;
      color: #a00000;
    }

    .notice,
    .empty {
      margin: 18px 0;
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

    .empty {
      text-align: center;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, .55);
      z-index: 10;
    }

    .modal {
      position: fixed;
      z-index: 11;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(
        540px,
        calc(100% - 30px)
      );
      max-height: 90vh;
      overflow: auto;
      padding: 30px;
      background: #fff;
      border: 3px solid var(--ink);
      box-shadow:
        9px 9px var(--pink);
    }

    .modal-heading {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      border-bottom:
        2px solid var(--ink);
    }

    .modal-heading span {
      color: var(--pink);
      font-size: .58rem;
      font-weight: 900;
      text-transform: uppercase;
    }

    .modal-heading h2 {
      margin: 6px 0 18px;
      font-family: var(--font-display);
      text-transform: uppercase;
    }

    .modal-heading > button {
      align-self: flex-start;
      background: none;
      border: 0;
      font-size: 2rem;
      cursor: pointer;
    }

    .modal form {
      display: grid;
      gap: 16px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .modal-actions .cancel {
      background: #fff;
      color: var(--ink);
    }

    @media (max-width: 850px) {
      header {
        align-items: flex-start;
        flex-direction: column;
      }

      .heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .items article {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 520px) {
      nav {
        gap: 10px;
      }

      .brand span {
        display: none;
      }

      .stats {
        width: 100%;
      }

      .actions,
      .modal-actions {
        display: grid;
      }
    }
  `]
})
export class InventoryViewComponent
  implements OnInit {

  materials: RawMaterial[] = [];
  categories: InventoryCategory[] = [];

  searchText = '';
  categoryFilter = '';

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  selectedMaterial:
    RawMaterial | null = null;

  adjustmentType:
    'add' | 'remove' = 'add';

  readonly adjustmentForm =
    this.formBuilder.nonNullable.group({
      quantity: [
        1,
        [
          Validators.required,
          Validators.min(0.000001)
        ]
      ],

      employeeName: [
        '',
        [
          Validators.required,
          Validators.maxLength(120)
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

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get lowStockCount(): number {
    return this.materials.filter(
      (item) => this.isLowStock(item)
    ).length;
  }

  get filteredMaterials(): RawMaterial[] {
    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.materials.filter(
      (item) => {
        const categoryMatches =
          !this.categoryFilter ||
          item.category?._id ===
            this.categoryFilter;

        const searchableText =
          `${item.name} ` +
          `${item.category?.name || ''} ` +
          `${item.notes}`;

        const searchMatches =
          !search ||
          searchableText
            .toLowerCase()
            .includes(search);

        return (
          categoryMatches &&
          searchMatches
        );
      }
    );
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.inventoryService
      .getMaterials()
      .pipe(
        finalize(
          () => this.loading = false
        )
      )
      .subscribe({
        next: (items) => {
          this.materials = items;
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Inventory could not be loaded.'
            );
        }
      });

    this.inventoryService
      .getCategories()
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        }
      });
  }

  openAdjustment(
    material: RawMaterial,
    type: 'add' | 'remove'
  ): void {
    this.selectedMaterial = material;
    this.adjustmentType = type;

    this.errorMessage = '';
    this.successMessage = '';

    this.adjustmentForm.reset({
      quantity: 1,
      employeeName: '',
      notes: ''
    });
  }

  closeAdjustment(): void {
    if (!this.saving) {
      this.selectedMaterial = null;
    }
  }

  submitAdjustment(): void {
    this.adjustmentForm.markAllAsTouched();

    if (
      !this.selectedMaterial ||
      this.adjustmentForm.invalid ||
      this.saving
    ) {
      return;
    }

    const value =
      this.adjustmentForm.getRawValue();

    this.saving = true;

    this.inventoryService
      .adjustQuantity(
        this.selectedMaterial._id,
        {
          type: this.adjustmentType,

          quantity:
            Number(value.quantity),

          employeeName:
            value.employeeName,

          notes:
            value.notes
        }
      )
      .pipe(
        finalize(
          () => this.saving = false
        )
      )
      .subscribe({
        next: ({ material }) => {
          this.materials =
            this.materials.map(
              (item) =>
                item._id === material._id
                  ? material
                  : item
            );

          this.successMessage =
            this.adjustmentType === 'add'
              ? 'Stock added successfully.'
              : 'Stock removed successfully.';

          this.selectedMaterial = null;
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            this.message(
              error,
              'Quantity could not be changed.'
            );
        }
      });
  }

  isLowStock(
    material: RawMaterial
  ): boolean {
    return (
      material.quantity <=
      material.minimumQuantity
    );
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