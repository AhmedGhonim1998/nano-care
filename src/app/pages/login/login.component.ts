import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // مهم جداً لاستخدام الفورم
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';
//signup: string|any[]|UrlTree|null|undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    // تعريف الحقول والـ Validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // جوه دالة الـ onSubmit أو login في الـ LoginComponent
onSubmit() {
  if (this.loginForm.valid) {
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        // 1. خزن الـ Token الأول
        localStorage.setItem('token', res.token);
        
        // 2. نادى على دالة تحديث السلة من الـ CartService
        this.cartService.updateCartAfterLogin(); 
        
        // 3. كمل الـ Navigate بتاعك
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = "بيانات الدخول غير صحيحة";
      }
    });
  }
}


  
}