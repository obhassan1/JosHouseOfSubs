import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RawMaterial,
  RawMaterialPayload
} from '../models/raw-material';

@Injectable({
  providedIn: 'root'
})
export class RawMaterialService {
  private readonly url =
    `${environment.apiUrl}/admin/raw-materials`;

  constructor(
    private readonly http: HttpClient
  ) { }

  getMaterials(): Observable<RawMaterial[]> {
    return this.http.get<RawMaterial[]>(
      this.url
    );
  }

  createMaterial(
    material: RawMaterialPayload
  ): Observable<RawMaterial> {
    return this.http.post<RawMaterial>(
      this.url,
      material
    );
  }

  updateMaterial(
    id: string,
    material: RawMaterialPayload
  ): Observable<RawMaterial> {
    return this.http.put<RawMaterial>(
      `${this.url}/${id}`,
      material
    );
  }

  deleteMaterial(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`
    );
  }
}