import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartService } from './cart.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 1. خلي الـ URL يقف عند اسم الكنترولر (auth) بس
  private apiUrl = 'https://api.nanocareegypt.com/api/auth'; 

  constructor(private http: HttpClient, private cartService: CartService , private router: Router) {}



 

  login(credentials: any) {
    // 2. زود كلمة /login هنا
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

   // امسح أي تكرار وخليها نسخة واحدة بس بالشكل ده
logout() {
  // 1. مسح التوكن الخاص بجلسة المستخدم
  localStorage.removeItem('token');

  // 2. مسح معرف السلة عشان ميتداخلش مع مستخدم تاني
  localStorage.removeItem('cart_id');

  // 3. تصفير السلة في الـ UI (لو حقنته) أو عمل ريفريش
  // this.cartService.clearCartData(); // لو عامل Inject للـ CartService
  
  // 4. توجيه المستخدم لصفحة اللوجين
  this.router.navigate(['/login']);

  // ملحوظة: لو واجهت صعوبة في الربط بين السيرفس، السطر ده هينظف كل حاجة
  // window.location.reload(); 
}

  register(userData: any): Observable<any> {
    // 3. زود كلمة /register هنا.. كدة هتروح لـ api/auth/register صح
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  getToken() {
    return localStorage.getItem('token');
  }

 
}