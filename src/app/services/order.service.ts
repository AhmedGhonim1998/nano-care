import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateOrderDto, Order, CartItem, ShippingAddress } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new order with customer info and cart
   * @param customerInfo Customer details (firstName, lastName, email, address, message)
   * @param userId User ID from token or guest ID
   * @param cartId Cart ID to fetch items from
   */
 // src/app/services/order.service.ts

// تأكد إن السطر ده مكتوب كدة بالظبط (3 بارامترات)
createOrder(customerInfo: any, userId: string, cartId: string): Observable<any> {
  const checkoutDto = {
    userId: userId,      // المعرف بتاع اليوزر
    cartId: cartId,      // 👈 السطر ده هو اللي كان ناقص جوه الـ DTO
    firstName: customerInfo.firstName,
    lastName: customerInfo.lastName,
    email: customerInfo.email,
    address: customerInfo.address,
    extraMessage: customerInfo.extraMessage || customerInfo.message || "" 
  };
  
  console.log('📤 Sending Final DTO to Backend:', checkoutDto);
  
  return this.http.post<any>(`${this.apiUrl}/checkout`, checkoutDto);
}

  /**
   * Fetch an order by ID
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Fetch all orders for the current user
   */
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user-orders`);
  }
}