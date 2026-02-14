import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Category } from './models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  // Fallback mock data
  private mockCategories: Category[] = [
    { id: 1, name: 'Marine & Bovine Blend' },
    { id: 2, name: 'High Absorption Formula' },
    { id: 3, name: 'Bone & Immune Support' },
    { id: 4, name: 'Muscle & Nerve Support' },
    { id: 5, name: 'Cardiovascular Health' },
    { id: 6, name: 'Gut Health Formula' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Fetch all categories from the API
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError(() => of(this.mockCategories))
    );
  }

  /**
   * Fetch a single category by ID
   */
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const category = this.mockCategories.find(c => c.id === id);
        return of(category!);
      })
    );
  }
}
