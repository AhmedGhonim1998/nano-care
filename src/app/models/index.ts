// Product and Category Models
export interface Category {
  id: string; // تغيير من number لـ string
  name: string;
}

export interface Product {
  id: string;
  _id?: string;        // للتوافق مع MongoDB
  name: string;
  description?: string;
  price: number;
  image?: string;      // <-- الصورة النهائية اللي هنعرضها
  imageUrl?: string;   // <-- الصورة من السيرفر
  category?: string;
  categoryId?: string;
  rating?: number;
  reviewCount?: number;
  tag?: string;
  tagColor?: string;
  isNew?: boolean;
  isLimited?: boolean;
  features?: string[];


  dosage?: string;
  indication?: string;
  warning?: string;
  packSize?: string;

  gallery?: string[];

}



export interface PaginatedProductResponse {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Cart Item Model
// models.ts
export interface CartItem {
  productId: any;     // خليها any مؤقتاً عشان يقبل String و Number
  id?: any;           // أضف دي عشان لو الـ HTML بيدور على id
  productName: string;
  name?: string;      // أضف دي عشان لو الـ HTML بيدور على name
  price: number;
  imageUrl: string;
  image?: string;     // أضف دي عشان لو الـ HTML بيدور على image
  quantity: number;
}

// Order Models
export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  phone: string;
}

export interface OrderItem {
  productId: string; // لازم يكون String عشان المونجو
  quantity: number;
}
export interface CreateOrderDto {
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number; // 👈 تأكد إن السطر ده موجود هنا
}

export interface Order {
  id: string;
  orderDate: string;
  customerEmail: string;
  items: any[];
  totalPrice: number;
  status: string;
} 
