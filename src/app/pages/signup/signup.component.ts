import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html'
})
// signup.component.ts
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator }); // Validator للتأكد من التطابق
  }

  // دالة التأكد إن كلمة السر هي هي التأكيد
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Sending data:', this.signupForm.value); // عشان تراجع الـ Object اللي طالع
      this.authService.register(this.signupForm.value).subscribe({
        next: (res) => {
          alert('Account created successfully!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Signup failed.';
        }
      });
    }
  }
}