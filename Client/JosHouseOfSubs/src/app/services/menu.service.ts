import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem, MenuItemPayload } from '../models/menu-item';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly publicUrl = `${environment.apiUrl}/menu`;
  private readonly adminUrl = `${environment.apiUrl}/admin/menu`;

  constructor(private readonly http: HttpClient) { }

  getPublicItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.publicUrl);
  }

  getAdminItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.adminUrl);
  }

  createItem(item: MenuItemPayload): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.adminUrl, item);
  }

  updateItem(id: string, item: MenuItemPayload): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.adminUrl}/${id}`, item);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}