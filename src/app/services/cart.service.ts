import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { CartItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://api.nanocareegypt.com/api/carts'; 
  private ordersUrl = 'https://api.nanocareegypt.com/api/orders/checkout';
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  private orderSummary$ = new BehaviorSubject<any>(null);
  private isLoading = false; // ✅ منع التحميل المتكرر

private cartId: string;

  constructor(private http: HttpClient) {
  this.cartId = this.getOrCreateCartId();
  this.loadCartFromServer();
}


private getOrCreateCartId(): string {
  const token = localStorage.getItem('token');

  if (token && token !== 'undefined') {
    try {
      const userData = this.decodeToken(token);
      console.log('Decoded User Data:', userData); // 👈 بص على دي في الـ Console

      // في .NET، الـ ID غالباً بيكون اسمه 'nameid' أو 'sub'
      const userId = userData?.id || 
                     userData?.nameid || 
                     userData?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                     userData?.sub;

      if (userId) {
        return userId;
      }
    } catch (e) {
      console.error("Token decoding failed", e);
    }
  }

  // لو مفيش مستخدم، نرجع للـ LocalStorage بتاع المتصفح
  let anonymousId = localStorage.getItem('cart_id');
  
  // تأكد إن الـ ID مش كلمة "undefined" كـ نص
  if (!anonymousId || anonymousId === 'undefined' || anonymousId === 'null') {
    anonymousId = crypto.randomUUID();
    localStorage.setItem('cart_id', anonymousId);
  }
  
  return anonymousId;
}

private decodeToken(token: string): any {
  try {
    // فك التوكن يدويًا بطريقة الـ Base64
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}


public updateCartAfterLogin() {
  this.cartId = this.getOrCreateCartId(); // هيجيب الـ ID الجديد من الـ Token
  this.loadCartFromServer(); // هيحمل سلة المستخدم ده
}


// cart.service.ts
public clearCartData() {
  localStorage.removeItem('cart_id'); // نمسح الـ ID المخزن
  this.cartItems$.next([]); // نصفر السلة في الـ UI
  this.cartId = crypto.randomUUID(); // نجهز ID جديد عشوائي لو حد استخدم الجهاز كـ Guest
}


  createOrder(customerEmail: string): Observable<any> {
  const orderPayload = {
    userId: this.cartId,
    customerEmail: customerEmail
  };

  return this.http.post(this.ordersUrl, orderPayload).pipe(
    tap(() => {
      // ✅ أول ما الطلب ينجح، نمسح السلة من السيرفر ومن الـ UI
      this.clearCart(); 
    })
  );
}

  getCartId(): string {
    return this.cartId;
  }

  private loadCartFromServer() {
    // ✅ منع التحميل المتكرر
    if (this.isLoading) {
      console.log('⏳ Already loading cart...');
      return;
    }

    this.isLoading = true;
    console.log('📥 Loading cart from server...');

    this.http.get<any>(`${this.apiUrl}/${this.cartId}`).pipe(
      catchError(err => {
        console.error('❌ Failed to load cart:', err);
        this.isLoading = false;
        return of({ items: [] }); // ✅ رجع سلة فاضية لو في مشكلة
      })
    ).subscribe({
      next: (cart) => {
        console.log('📦 Cart data from server:', cart);
        
        if (cart && cart.items && Array.isArray(cart.items)) {
          // ✅ تنضيف الداتا وتوحيد الأسماء
          const items = cart.items.map((item: any) => {
            const cleanItem = {
              productId: String(item.productId || item.ProductId || ''),
              productName: String(item.productName || item.ProductName || 'Unknown'),
              price: Number(item.price || item.Price || 0),
              quantity: Number(item.quantity || item.Quantity || 1),
              imageUrl: String(item.imageUrl || item.ImageUrl || 'https://via.placeholder.com/150')
            };
            
            console.log('🔍 Cleaned item:', cleanItem);
            return cleanItem;
          });

          this.cartItems$.next(items);
          console.log(`✅ Cart loaded: ${items.length} items`);
        } else {
          console.log('📭 Empty cart');
          this.cartItems$.next([]);
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading cart:', err);
        this.cartItems$.next([]);
        this.isLoading = false;
      }
    });
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$.asObservable();
  }

  getTotalPrice(): number {
    return this.cartItems$.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  addToCart(product: any, quantity: number = 1) {
    const pId = String(product.id || product._id || product.productId);
    console.log('➕ Adding to cart:', pId, 'quantity:', quantity);

    const currentItems = [...this.cartItems$.value];
    const existingItemIndex = currentItems.findIndex(i => 
      String(i.productId) === pId
    );

    let updatedItems = [...currentItems];

    if (existingItemIndex > -1) {
      // ✅ المنتج موجود - زود الكمية
      updatedItems[existingItemIndex].quantity += Number(quantity);
      console.log(`📦 Updated quantity: ${updatedItems[existingItemIndex].quantity}`);
    } else {
      // ✅ منتج جديد - ضيفه
      const newItem: any = {
        productId: pId,
        productName: String(product.name || product.productName || 'Unknown'),
        price: Number(product.price || 0),
        quantity: Number(quantity),
        imageUrl: String(product.imageUrl || product.image || 'https://via.placeholder.com/150')
      };
      updatedItems.push(newItem);
      console.log('✨ Added new item');
    }

    // ✅ احفظ في الـ database
    this.saveCartToServer(updatedItems);
  }

  updateQuantity(productId: string | number, quantity: number): void {
    console.log('🔄 Updating quantity:', productId, 'to', quantity);
    
    if (quantity < 1) {
      console.warn('⚠️ Quantity must be at least 1');
      return;
    }

    const currentItems = [...this.cartItems$.value];
    const itemIndex = currentItems.findIndex(i => 
      String(i.productId) === String(productId)
    );

    if (itemIndex > -1) {
      // ✅ غير الكمية
      currentItems[itemIndex].quantity = Number(quantity);
      console.log(`📝 Updated quantity to: ${quantity}`);
      
      // ✅ احفظ في الـ database
      this.saveCartToServer(currentItems);
    } else {
      console.error('❌ Product not found:', productId);
    }
  }

 removeFromCart(productId: string | number) {
  const url = `${this.apiUrl}/${this.cartId}/items/${productId}`;

  this.http.delete(url).subscribe({
    next: () => {
      // شيل من ال UI بعد ما السيرفر ينجح
      const updatedItems = this.cartItems$.value.filter(item =>
        String(item.productId) !== String(productId)
      );

      this.cartItems$.next(updatedItems);
    },
    error: (err) => {
      console.error('❌ Failed to delete item:', err);
    }
  });
}


clearCart() {
  console.log('🧹 Clearing cart for ID:', this.cartId);
  
  // ✅ التعديل: شلنا الـ ?id= وخليناها سلاش مباشرة
  return this.http.delete(`${this.apiUrl}/${this.cartId}`).subscribe({
    next: () => {
      this.cartItems$.next([]);
      console.log('✅ Cart cleared from DB and UI');
    },
    error: (err) => {
      console.error('❌ Failed to clear cart:', err);
      // حتى لو السيرفر فشل، صفر السلة في الـ UI عشان العميل ميتلخبطش
      this.cartItems$.next([]); 
    }
  });
}

  // ✅ دالة واحدة للحفظ في الـ database
  private saveCartToServer(items: any[]) {
    console.log('💾 Saving to server...', items);
    
    const cartData = {
      Id: String(this.cartId),
      Items: items.map(item => ({
        ProductId: String(item.productId),
        ProductName: String(item.productName),
        Price: Number(item.price),
        Quantity: Number(item.quantity),
        ImageUrl: String(item.imageUrl)
      }))
    };

    console.log('📤 Sending to server:', cartData);

    this.http.post(this.apiUrl, cartData).subscribe({
      next: () => {
        console.log('✅ Saved to server successfully');
        // ✅ حدث الـ UI
        this.cartItems$.next(items);
      },
      error: (err) => {
        console.error('❌ Failed to save:', err);
        console.error('Error details:', err.error);
      }
    });
  }

  setOrderSummary(summary: any) {
    this.orderSummary$.next(summary);
  }

  // ✅ دالة لإعادة تحميل السلة يدوياً
  refreshCart() {
    console.log('🔄 Refreshing cart manually...');
    this.isLoading = false;
    this.loadCartFromServer();
  }
}