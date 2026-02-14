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
   * Create a new order with shipping details and cart items
   * @param cartItems Current items in the shopping cart
   * @param shippingAddress Shipping address details (fullName, address, city, phone)
   */
 // src/app/services/order.service.ts

// غير OrderResponseDto لـ Order
createOrder(customerInfo: any, userId: string): Observable<any> {
  const checkoutDto = {
    userId: userId,
    firstName: customerInfo.firstName,
    lastName: customerInfo.lastName,
    email: customerInfo.email,
    address: customerInfo.address,
    extraMessage: customerInfo.message
  };

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
