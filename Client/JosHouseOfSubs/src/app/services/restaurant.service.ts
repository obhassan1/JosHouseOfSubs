import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RestaurantDetails } from '../models/restaurant';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly apiUrl = `${environment.apiUrl}/restaurant`;

  constructor(private http: HttpClient) { }

  getDetails(): Observable<RestaurantDetails> {
    return this.http.get<RestaurantDetails>(this.apiUrl);
  }
}
