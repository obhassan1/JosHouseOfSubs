import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  InventoryMovement
} from '../../models/raw-material';

import {
  AuthService
} from '../../services/auth.service';

import {
  RawMaterialService
} from '../../services/raw-material.service';

@Component({
  selector: 'app-inventory-history',

  template: `
    <main>
      <header>
        <a routerLink="/staff/inventory">
          ← Inventory
        </a>

        <strong>Inventory history</strong>

        <nav>
          <a
            *ngIf="isSuperAdmin"
            routerLink="/staff/inventory/manage"
          >
            Manage
          </a>

          <button (click)="logout()">
            Sign out
          </button>
        </nav>
      </header>

      <section class="content">
        <div class="heading">
          <p>Permanent audit record</p>

          <h1>
            Stock<br>
            <em>history.</em>
          </h1>
        </div>

        <div class="filters">
          <label>
            <span>Search</span>

            <input
              type="search"
              [(ngModel)]="searchText"
              placeholder="Employee, item, or note"
            >
          </label>

          <label>
            <span>Movement</span>

            <select [(ngModel)]="typeFilter">
              <option value="">All</option>
              <option value="add">Added</option>
              <option value="remove">Removed</option>
            </select>
          </label>

          <button
            (click)="load()"
            [disabled]="loading"
          >
            {{ loading ? 'Loading…' : 'Refresh' }}
          </button>
        </div>

        <div
          class="error"
          *ngIf="errorMessage"
        >
          {{ errorMessage }}
        </div>

        <div
          class="empty"
          *ngIf="
            !loading &&
            filteredMovements.length === 0
          "
        >
          No matching inventory changes.
        </div>

        <div
          class="table-wrap"
          *ngIf="filteredMovements.length"
        >
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Item</th>
                <th>Change</th>
                <th>Before → After</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              <tr
                *ngFor="
                  let movement of filteredMovements
                "
              >
                <td>
                  {{
                    movement.createdAt |
                    date:'medium'
                  }}
                </td>

                <td>
                  <strong>
                    {{ movement.employeeName }}
                  </strong>

                  <small>
                    Login:
                    {{ movement.accountUsername }}
                  </small>
                </td>

                <td>
                  {{ movement.materialName }}
                </td>

                <td>
                  <span
                    class="movement"
                    [class.remove]="
                      movement.type === 'remove'
                    "
                  >
                    {{
                      movement.type === 'add'
                        ? '+'
                        : '−'
                    }}

                    {{ movement.quantity }}
                    {{ movement.unit }}
                  </span>
                </td>

                <td>
                  {{ movement.previousQuantity }}
                  →
                  {{ movement.newQuantity }}
                  {{ movement.unit }}
                </td>

                <td>
                  {{ movement.notes || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

    .heading p {
      color: var(--pink);
      font-size: .65rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .14em;
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

    .filters {
      margin: 35px 0 22px;
      padding: 20px;
      display: grid;
      grid-template-columns:
        1fr 220px auto;
      gap: 15px;
      align-items: flex-end;
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
    }

    input,
    select {
      width: 100%;
      min-height: 46px;
      padding: 10px;
      background: var(--cream);
      border: 2px solid var(--ink);
    }

    .filters button {
      min-height: 46px;
      padding: 0 17px;
      background: var(--pink);
      color: #fff;
      border: 2px solid var(--ink);
      font-size: .58rem;
      font-weight: 900;
      text-transform: uppercase;
    }

    .table-wrap {
      overflow: auto;
      background: #fff;
      border: 3px solid var(--ink);
      box-shadow: 6px 6px var(--ink);
    }

    table {
      width: 100%;
      min-width: 950px;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #ccc;
      font-size: .75rem;
    }

    th {
      background: var(--ink);
      color: #fff;
      text-transform: uppercase;
      font-size: .56rem;
      letter-spacing: .08em;
    }

    td small {
      display: block;
      margin-top: 4px;
      color: #777;
    }

    .movement {
      display: inline-block;
      padding: 7px 9px;
      background: #dff3e4;
      color: #146b31;
      border: 1px solid #146b31;
      font-weight: 900;
    }

    .movement.remove {
      background: #ffe5e5;
      color: #a00000;
      border-color: #a00000;
    }

    .error,
    .empty {
      padding: 16px;
      background: #fff;
      border: 2px solid var(--ink);
    }

    .error {
      border-left: 7px solid #c50000;
    }

    @media (max-width: 700px) {
      header {
        align-items: flex-start;
        flex-direction: column;
      }

      .filters {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InventoryHistoryComponent
  implements OnInit {

  movements: InventoryMovement[] = [];

  searchText = '';
  typeFilter = '';

  loading = true;
  errorMessage = '';

  constructor(
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

  get filteredMovements():
    InventoryMovement[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.movements.filter(
      (movement) => {
        const typeMatches =
          !this.typeFilter ||
          movement.type ===
            this.typeFilter;

        const searchableText =
          `${movement.employeeName} ` +
          `${movement.materialName} ` +
          `${movement.notes} ` +
          `${movement.accountUsername}`;

        const searchMatches =
          !search ||
          searchableText
            .toLowerCase()
            .includes(search);

        return (
          typeMatches &&
          searchMatches
        );
      }
    );
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.inventoryService
      .getHistory()
      .pipe(
        finalize(
          () => this.loading = false
        )
      )
      .subscribe({
        next: (movements) => {
          this.movements = movements;
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.errorMessage =
            error.error?.message ||
            'Inventory history could not be loaded.';
        }
      });
  }

  logout(): void {
    this.authService.logout();

    void this.router.navigate([
      '/staff/login'
    ]);
  }
}