// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models';
import { OrderService } from '../../services/order.service'; // تأكد من المسار
import { ShippingAddress } from '../../models';

interface CartItemExtended extends CartItem {
  tag?: string;
  description?: string;
  isBestSeller?: boolean;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  message: string;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class CartComponent implements OnInit {
  cartItems: CartItemExtended[] = [];
  totalPrice: number = 0;
  discountAmount: number = 0;
  discountCode: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Customer information
  customerInfo: CustomerInfo = {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    message: ''
  };

  constructor(
  private cartService: CartService,
  private router: Router,
  private orderService: OrderService // 👈 ضيف السطر ده هنا
) {}

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
  this.cartService.getCartItems().subscribe(items => {
    if (!items) return; // تأمين لو السلة فاضية

    this.cartItems = items.map(item => {
      // 1. استخراج الداتا بأي مسمى جاية بيه
      const pId = item.productId || (item as any).id || (item as any)._id;
      const pName = item.productName || (item as any).name;
      const pImage = (item as any).pictureUrl || item.imageUrl || (item as any).image;

      // 2. بناء كائن جديد "نضيف" الـ HTML يقدر يقرأه بسهولة
      return {
        ...item,
        productId: String(pId),   // توحيد الـ ID
        productName: pName,       // توحيد الاسم عشان الـ undefined
        imageUrl: pImage,         // توحيد الصورة
        price: Number(item.price), // ضمان إن السعر رقم للحسابات
        quantity: Number(item.quantity),
        // الخواص الإضافية للـ UI
        tag: (item as any).tag || this.getRandomTag(),
        description: (item as any).description || this.getDescription(pName),
        isBestSeller: (item as any).isBestSeller !== undefined ? (item as any).isBestSeller : Math.random() > 0.5
      };
    });

    this.calculateTotal(); // حساب الإجمالي بعد ما الداتا بقت جاهزة
  });
}
  getRandomTag(): string {
    const tags = ['Best Seller', 'Most Popular', 'New Formula', 'Limited Stock'];
    return tags[Math.floor(Math.random() * tags.length)];
  }

  getDescription(productName: string): string {
    const descriptions = [
      'Premium liposomal formula for optimal cellular absorption',
      'Advanced nano-encapsulation technology for maximum efficacy',
      'Clinically-proven formula with 98% absorption rate',
      'Pure, high-quality ingredients for superior results'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  calculateTotal() {
    this.totalPrice = this.cartService.getTotalPrice();
  }

  calculateFinalTotal(): number {
    const subtotal = this.totalPrice;
    const tax = subtotal * 0;
    return subtotal + tax - this.discountAmount;
  }

  updateQuantity(productId: any, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeItem(productId);
    } else if (newQuantity > 10) {
      alert('Maximum quantity is 10 per item');
    } else {
      this.cartService.updateQuantity(productId, newQuantity);
      this.calculateTotal();
    }
  }

  removeItem(productId: any) {
    if (confirm('Remove this item from your cart?')) {
      this.cartService.removeFromCart(productId);
      this.calculateTotal();
    }
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.cartService.clearCart();
      this.cartItems = [];
      this.calculateTotal();
    }
  }

  isFormValid(): boolean {
    // Check required fields
    const hasFirstName = this.customerInfo.firstName.trim().length > 0;
    const hasLastName = this.customerInfo.lastName.trim().length > 0;
    const hasEmail = this.customerInfo.email.trim().length > 0;
    const hasAddress = this.customerInfo.address.trim().length > 0;
    
    // Basic email validation
    const isEmailValid = this.isEmailValid();
    
    return hasFirstName && hasLastName && hasEmail && hasAddress && isEmailValid;
  }

  isEmailValid(): boolean {
    if (!this.customerInfo.email.trim()) {
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.customerInfo.email);
  }

  applyDiscount() {
    const code = this.discountCode.trim().toUpperCase();
    
    if (!code) {
      alert('Please enter a discount code');
      return;
    }

    const discounts: { [key: string]: number } = {
      'WELCOME10': 0.10, // 10% off
      'SAVE20': 0.20,    // 20% off
      'HEALTH15': 0.15,  // 15% off
      'FIRSTORDER': 0.25 // 25% off
    };

    if (discounts[code]) {
      const discountRate = discounts[code];
      const subtotal = this.totalPrice;
      this.discountAmount = subtotal * discountRate;
      alert(`🎉 Discount applied! You saved ${discountRate * 100}% (EGP ${this.discountAmount.toFixed(2)})`);
    } else {
      alert('❌ Invalid discount code. Please try another code.');
      this.discountAmount = 0;
    }
  }

  validateCustomerInfo(): boolean {
    if (!this.customerInfo.firstName.trim()) {
      alert('Please enter your first name');
      return false;
    }

    if (!this.customerInfo.lastName.trim()) {
      alert('Please enter your last name');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.customerInfo.email.trim() || !emailPattern.test(this.customerInfo.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (!this.customerInfo.address.trim()) {
      alert('Please enter your delivery address');
      return false;
    }

    return true;
  }

 checkout(): void {
  if (this.cartItems.length === 0) {
    alert('السلة فارغة!');
    return;
  }

  const checkoutPayload = {
    userId: this.cartService.getCartId(), // أو userId
    customerInfo: this.customerInfo,
    items: this.cartItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl
    }))
  };

  this.orderService.createOrder(checkoutPayload.customerInfo, checkoutPayload.userId)
  .subscribe({
    next: (res) => {
      console.log('✅ Order Created:', res);
      alert('تم تسجيل طلبك بنجاح!');
      this.cartService.clearCart();
      this.router.navigate(['/orders']);
    },
    error: (err: any) => {
      console.error('❌ Error details:', err);
      this.errorMessage = "حدث خطأ أثناء إتمام الطلب";
    }
  });

}

}