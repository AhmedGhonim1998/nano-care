import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { CartItem } from '../../models';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the reactive form with validation
   */
  private initializeForm(): void {
    this.checkoutForm = this.formBuilder.group({
      customerEmail: ['', [Validators.required, Validators.email]], // Added email field
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]]
    });
  }

  /**
   * Load cart items and calculate total
   */
  private loadCartItems(): void {
    this.cartService.getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe((items: CartItem[]) => {
        this.cartItems = items;
        
        // Calculate total
        this.totalAmount = items.reduce((total: number, item: CartItem) => {
          return total + ((item.price || 0) * (item.quantity || 0));
        }, 0);

        console.log('Cart Items Loaded:', this.cartItems);
        console.log('Total Amount:', this.totalAmount);

        // Redirect if cart is empty
        if (items.length === 0 && !this.successMessage) {
          console.warn('Cart is empty, redirecting to products...');
          this.router.navigate(['/products']);
        }
      });
  }

  /**
   * Handle form submission and create order
   */
 placeOrder(): void {
    if (!this.checkoutForm.valid) {
      this.errorMessage = "Please fill all required fields correctly.";
      return;
    }

    this.isSubmitting = true;
    
    // 1. هات الـ ID من السيرفس
    const cartId = this.cartService.getCartId();
    const userId = cartId; // في حالتك هما نفس القيمة

    // 2. التعديل الجوهري: ابعت الـ 3 حاجات (customerInfo, userId, cartId) 👈
    this.orderService.createOrder(this.checkoutForm.value, userId, cartId).subscribe({
      next: (response) => {
        console.log('✅ Order created successfully!', response);
        this.successMessage = `Order #${response.id} placed successfully!`;
        this.isSubmitting = false;

        this.cartService.clearCart();

        setTimeout(() => {
          this.router.navigate(['/order-confirmation'], {
            state: { order: response }
          });
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Order failed:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || err.error || "Failed to place order.";
      }
    });
  }
  /**
   * Convenience getter for form controls
   */
  get f() {
    return this.checkoutForm.controls;
  }

  /**
   * Check if a form control has an error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }
}