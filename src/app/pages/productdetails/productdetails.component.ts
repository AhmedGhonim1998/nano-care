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

loadProductFromServer(id: string) {
  this.isLoading = true;

  this.productService.getProductById(id).subscribe({
    next: (data) => {

      this.product = {
  id: data.id,
  name: data.name,
  price: data.price,
  description: data.description ?? '',
  features: data.features ?? [],
  categoryId: data.categoryId ?? '',
  image: data.imageUrl 
    ? `https://localhost:44353${data.imageUrl}`
    : 'assets/placeholder.png'
};


      this.selectedImage = this.product.image!;
      this.isLoading = false;
    },

    error: (err) => {
      console.error(err);
      this.isLoading = false;
    }
  });
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
