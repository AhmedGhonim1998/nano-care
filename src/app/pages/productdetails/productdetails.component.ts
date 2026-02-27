import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models'; // تأكد إن الـ interface فيه _id

@Component({
  selector: 'app-product-detail',
  templateUrl: './productdetails.component.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {
  product: Product & { id: string; image: string } | null = null; // ضمنا id و image
  quantity: number = 1;
  selectedImage: string = '';
  selectedImageIndex: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProductFromServer(id);
      }
    });
  }

// داخل loadProductFromServer في ملف الـ component.ts

loadProductFromServer(id: string) {
  this.isLoading = true;
  const baseUrl = 'https://api.nanocareegypt.com'; // لينك الـ API بتاعك

  this.productService.getProductById(id).subscribe({
  next: (data: any) => {
    const baseUrl = 'https://api.nanocareegypt.com';

    // معالجة الجاليري
    let galleryImages = data.images?.map((img: string) => 
      img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? img : '/' + img}`
    ) || [];

    const mainImage = data.imageUrl 
      ? (data.imageUrl.startsWith('http') ? data.imageUrl : `${baseUrl}${data.imageUrl}`)
      : 'assets/placeholder.png';

    this.product = {
      ...data, // دي لوحدها هتسحب Dosage و Warning و Indication و PackSize
      id: data.id,
      image: mainImage,
      gallery: galleryImages.length > 0 ? galleryImages : [mainImage]
    };

    this.selectedImage = mainImage;
    this.isLoading = false;
  }
});
}

// ميثود جديدة عشان تجيب كل الصور للعرض في الـ Thumbnails
getGallery(): string[] {
  // لو الـ gallery موجود رجعه، لو لأ رجع الصورة الرئيسية في مصفوفة
  return (this.product as any)?.gallery?.length > 0 
    ? (this.product as any).gallery 
    : [this.selectedImage];
}





  addToCart(product: any) {
  this.cartService.addToCart(product, this.quantity); // بعتنا الـ quantity اللي اليوزر اختارها
  alert(`${product.name} تم إضافته للسلة!`);
}

 getAdditionalImages(): string[] {
  // مثال على صور إضافية
  return ['assets/1.jpg', 'assets/2.jpg'];
}

getAllImages(): string[] {
  const images: string[] = [];
  
  // الصورة الأساسية اللي جاية من السيرفر
  if (this.product?.image) {
    images.push(this.product.image);
  }
  
  // الصور الإضافية (assets)
  const additional = ['assets/1.jpg', 'assets/2.jpg']; // ممكن تغيرهم حسب اللي عندك
  
  return [...images, ...additional];
}

// تعديل ميثود الإضافة للسلة عشان تبعت الـ Quantity المختارة


selectImage(index: number) {
  this.selectedImageIndex = index;
  const images = this.getAllImages();
  this.selectedImage = images[index];
}
}
