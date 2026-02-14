import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PaginatedProductResponse, Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // The base URL from environment file
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  /**
   * Get products with pagination, search, and category filter support
   */
  getProducts(
    pageNumber: number = 1, 
    pageSize: number = 6, 
    searchTerm?: string, 
    categoryId?: string
  ): Observable<PaginatedProductResponse> {
    
    // Prepare query parameters
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    // Add search term if provided
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('searchTerm', searchTerm);
    }

    // Add category filter if provided (and not "All Products")
    if (categoryId && categoryId !== 'All Products') {
      params = params.set('categoryId', categoryId);
    }

    console.log('Fetching products with params:', params.toString()); // Debug log

    // Execute the request
    return this.http.get<PaginatedProductResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        console.log('Product API Response:', response); // Debug: Log the full response
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        throw error;
      })
    );
  }

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(product => {
        console.log('Product details:', product); // Debug log
      }),
      catchError(error => {
        console.error('Error fetching product details:', error);
        throw error;
      })
    );
  }

  /**
   * Create a new product (Admin only)
   */
  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, formData);
  }

  /**
   * Delete a product (Admin only)
   */
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}