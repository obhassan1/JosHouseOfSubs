import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../environments/environment';

import {
  InventoryAdjustmentPayload,
  InventoryCategory,
  InventoryMovement,
  RawMaterial,
  RawMaterialPayload
} from '../models/raw-material';

@Injectable({
  providedIn: 'root'
})
export class RawMaterialService {
  private readonly adminUrl =
    `${environment.apiUrl}/admin`;

  private readonly materialsUrl =
    `${this.adminUrl}/raw-materials`;

  private readonly categoriesUrl =
    `${this.adminUrl}/inventory-categories`;

  constructor(
    private readonly http: HttpClient
  ) { }

  getMaterials(): Observable<RawMaterial[]> {
    return this.http.get<RawMaterial[]>(
      this.materialsUrl
    );
  }

  adjustQuantity(
    id: string,
    adjustment: InventoryAdjustmentPayload
  ): Observable<{
    material: RawMaterial;
    movement: InventoryMovement;
  }> {
    return this.http.post<{
      material: RawMaterial;
      movement: InventoryMovement;
    }>(
      `${this.materialsUrl}/${id}/adjust`,
      adjustment
    );
  }

  getHistory(): Observable<
    InventoryMovement[]
  > {
    return this.http.get<
      InventoryMovement[]
    >(
      `${this.adminUrl}/inventory-history`
    );
  }

  createMaterial(
    material: RawMaterialPayload
  ): Observable<RawMaterial> {
    return this.http.post<RawMaterial>(
      this.materialsUrl,
      material
    );
  }

  updateMaterial(
    id: string,
    material: RawMaterialPayload
  ): Observable<RawMaterial> {
    return this.http.put<RawMaterial>(
      `${this.materialsUrl}/${id}`,
      material
    );
  }

  deleteMaterial(
    id: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.materialsUrl}/${id}`
    );
  }

  getCategories(): Observable<
    InventoryCategory[]
  > {
    return this.http.get<
      InventoryCategory[]
    >(
      this.categoriesUrl
    );
  }

  createCategory(
    name: string,
    sortOrder = 0
  ): Observable<InventoryCategory> {
    return this.http.post<
      InventoryCategory
    >(
      this.categoriesUrl,
      {
        name,
        sortOrder
      }
    );
  }

  updateCategory(
    id: string,
    name: string,
    sortOrder = 0
  ): Observable<InventoryCategory> {
    return this.http.put<
      InventoryCategory
    >(
      `${this.categoriesUrl}/${id}`,
      {
        name,
        sortOrder
      }
    );
  }

  deleteCategory(
    id: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.categoriesUrl}/${id}`
    );
  }
}