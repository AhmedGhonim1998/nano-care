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
  phoneNumber: string;
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
    message: '',
    phoneNumber: '' 
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
    if (!items) return;

    this.cartItems = items.map(item => {
      const pId = item.productId || (item as any).id || (item as any)._id;
      const pName = item.productName || (item as any).name || (item as any).productName;
      
      // 1. تحديد الصورة الخام
      let pImage = item.imageUrl || (item as any).image || (item as any).pictureUrl || (item as any).ImageUrl;

      // 2. إصلاح لينك الصورة لو مش كامل
      if (pImage && !pImage.startsWith('http') && !pImage.startsWith('assets')) {
        // لو الصورة بتبدأ بـ / شيلها عشان متبقاش //
        const cleanPath = pImage.startsWith('/') ? pImage : `/${pImage}`;
        pImage = `https://api.nanocareegypt.com${cleanPath}`;
      } else if (!pImage) {
        pImage = 'assets/placeholder.png'; // صورة افتراضية لو مفيش خالص
      }

      return {
        ...item,
        productId: String(pId),
        productName: pName,
        imageUrl: pImage, // هنا الصورة بقت اللينك الكامل الصح
        price: Number(item.price),
        quantity: Number(item.quantity),
        tag: (item as any).tag || this.getRandomTag(),
        description: (item as any).description || this.getDescription(pName),
        isBestSeller: (item as any).isBestSeller !== undefined ? (item as any).isBestSeller : Math.random() > 0.5
      };
    });

    this.calculateTotal();
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
  const hasFirstName = this.customerInfo.firstName.trim().length > 0;
  const hasLastName = this.customerInfo.lastName.trim().length > 0;
  const hasEmail = this.customerInfo.email.trim().length > 0;
  const hasAddress = this.customerInfo.address.trim().length > 0;
  const hasPhone = this.customerInfo.phoneNumber.trim().length > 0; // ✅ جديد
  const isEmailValid = this.isEmailValid();
  
  return hasFirstName && hasLastName && hasEmail && hasAddress && hasPhone && isEmailValid;
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

    if (!this.customerInfo.phoneNumber.trim()) {
  alert('Please enter your phone number');
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
  // 1. التأكد إن السلة مش فاضية
  if (this.cartItems.length === 0) {
    alert('السلة فارغة!');
    return;
  }

  // 2. التأكد من صحة بيانات الفورم
  if (!this.validateCustomerInfo()) {
    return; 
  }

  this.isLoading = true;

  // 3. تجهيز البيانات (الـ 3 بارامترات)
  const customerInfo = this.customerInfo;
  const userId = this.cartService.getCartId(); // بنستخدم الـ ID اللي في السلة كـ UserId
  const cartId = this.cartService.getCartId(); // المفتاح اللي السيرفر هيسحب بيه الداتا

  // 4. المناداة بالترتيب الصحيح (customerInfo, userId, cartId)
  this.orderService.createOrder(customerInfo, userId, cartId)
  .subscribe({
    next: (res) => {
      console.log('✅ Order Created Successfully:', res);
      alert('تم تسجيل طلبك بنجاح!');
      
      // 5. تنظيف السلة وتوجيه العميل
      this.cartService.clearCart(); 
      this.router.navigate(['/home']); 
      this.isLoading = false;
    },
    error: (err: any) => {
      console.error('❌ Error during checkout:', err);
      this.errorMessage = "حدث خطأ أثناء إتمام الطلب";
      this.isLoading = false;
      
      // نصيحة: لو ظهرلك 400 Bad Request بص على الـ Network tab في المتصفح
      alert('فشل إتمام الطلب، راجع البيانات وحاول مرة أخرى');
    }
  });
}




}