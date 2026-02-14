// product.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, PaginatedProductResponse, CartItem } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product',
  templateUrl: './products.component.html', // Fixed: Changed to products.component.html
  styleUrls: ['./products.component.css'], // Fixed: Changed to products.component.css
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 0;
  totalItems: number = 0;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  showComingSoon: boolean = true;

  
  // Filter and search
  selectedCategory: string = 'All Products';
  searchTerm: string = '';
  categories: string[] = ['All Products', 'Collagen', 'Vitamins', 'Minerals', 'Proteins'];
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Favorites (stored in localStorage)
  favoriteIds: Set<string> = new Set();
  
  // Expose Math to template
  Math = Math;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.loadProducts();
  }

  /**
   * Load products from API with current filters and pagination
   */
  loadProducts(): void {
  this.isLoading = true;
  this.errorMessage = '';

  const categoryId = this.selectedCategory === 'All Products' ? undefined : this.selectedCategory;
  const search = this.searchTerm.trim() || undefined;

  // لاحظ إننا غيرنا نوع الـ response لـ any مؤقتاً عشان نتفادى أخطاء الـ Interface القديم
  this.productService.getProducts(this.currentPage, this.pageSize, search, categoryId)
    .subscribe({
      next: (response: any) => { 
        console.log('API Response received:', response); 
        
        // التعديل الجوهري: الـ API باعت "products" مش "items"
        const incomingProducts = response.products || []; 
        
        if (incomingProducts.length === 0) {
          console.warn('No products found in the response array');
        }
        
        // Mapping & Display
        this.products = this.mapProductsForDisplay(incomingProducts);
        this.filteredProducts = this.products;
        
        // تحديث بيانات الترقيم بناءً على أسماء الحقول اللي شفناها في الـ Console
        this.totalItems = response.total || 0; 
        this.currentPage = response.currentPage || 1;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.hasNextPage = response.hasMore || false;
        this.hasPreviousPage = this.currentPage > 1;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.isLoading = false;
        this.products = [];
        this.filteredProducts = [];
      }
    });
}


notifyMe() {
  alert('We will notify you when this product becomes available!');
  // You can replace this with a modal or email signup
}
  /**
   * Map API product data to include display properties
   */
  private mapProductsForDisplay(products: Product[]): Product[] {
    // Safety check: Ensure products is an array
    if (!products || !Array.isArray(products)) {
      console.warn('Products is not an array:', products);
      return [];
    }
    
    return products.map(product => ({
      ...product,
      // Ensure imageUrl exists, fallback to placeholder
      imageUrl: product.imageUrl || '/assets/images/placeholder.png',
      // Add tag color based on category or product properties
      tagColor: product.tagColor || this.getTagColorForProduct(product),
      // Add tag text (use existing or generate)
      tag: product.tag || this.getTagForProduct(product),
      // Add rating if not present
      rating: product.rating || 4.8,
      reviewCount: product.reviewCount || 120
    }));
  }

  /**
   * Get tag color class based on product category
   */
  private getTagColorForProduct(product: Product): string {
    const category = product.category?.toLowerCase() || '';
    
    if (category.includes('collagen')) {
      return 'bg-gradient-to-r from-pink-500 to-rose-500';
    } else if (category.includes('vitamin')) {
      return 'bg-gradient-to-r from-amber-500 to-orange-500';
    } else if (category.includes('mineral')) {
      return 'bg-gradient-to-r from-emerald-500 to-green-500';
    } else if (category.includes('protein')) {
      return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    } else {
      return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    }
  }

  /**
   * Get tag text for product
   */
  private getTagForProduct(product: Product): string {
    // Use API provided flags if available
    if (product.isNew) {
      return 'New';
    } else if (product.isLimited) {
      return 'Limited';
    }
    
    // Default tags based on category or random
    const tags = ['Best Seller', 'Popular', 'Premium', 'Top Rated'];
    return tags[Math.floor(Math.random() * tags.length)];
  }

  /**
   * Filter products by category
   */
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page when filtering
    this.loadProducts();
  }

  /**
   * Search products
   */
  searchProducts(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1; // Reset to first page when searching
    this.loadProducts();
  }

  /**
   * Pagination - Go to next page
   */
  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadProducts();
      this.scrollToTop();
    }
  }

  /**
   * Pagination - Go to previous page
   */
  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.loadProducts();
      this.scrollToTop();
    }
  }

  /**
   * Pagination - Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      this.scrollToTop();
    }
  }

  /**
   * Scroll to top of page
   */
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    
    // Convert Product to CartItem format
   const cartItem: any = {
  // 1. حول الـ ID لنص (String) لأن المونجو بتستخدم ObjectIds أو GUIDs كنصوص
  productId: String(product.id || (product as any).id), // جرب يقرأ id ولو ملقاش يقرأ _id (للتوافق مع MongoDB)
  
  // 2. استخدم productName بدل name عشان يطابق الـ DTO بتاعك
  productName: product.name,
  
  price: Number(product.price),
  
  // 3. تأكد إن الاسم imageUrl عشان الـ DTO يشوفه
  imageUrl: product.imageUrl || product.imageUrl || '/assets/images/placeholder.png',
  
  quantity: 1,
  category: product.category
};
    
    this.cartService.addToCart(cartItem, 1);
    
    // Show success message (you can use a toast notification service)
    alert(`${product.name} has been added to your cart!`);
  }

  /**
   * Toggle product favorite status
   */
  toggleFavorite(product: Product) {
  // نتأكد إن الـ id موجود قبل التعامل مع الـ Set
  if (!product.id) return;

  if (this.favoriteIds.has(product.id)) {
    this.favoriteIds.delete(product.id);
  } else {
    this.favoriteIds.add(product.id);
  }
}


  /**
   * Check if product is in favorites
   */
  isFavorite(productId: string): boolean {
    return this.favoriteIds.has(productId);
  }

  /**
   * Load favorites from localStorage
   */
  private loadFavorites(): void {
    const stored = localStorage.getItem('favoriteProducts');
    if (stored) {
      try {
        const favArray = JSON.parse(stored);
        this.favoriteIds = new Set(favArray);
      } catch (e) {
        console.error('Error loading favorites:', e);
        this.favoriteIds = new Set();
      }
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveFavorites(): void {
    const favArray = Array.from(this.favoriteIds);
    localStorage.setItem('favoriteProducts', JSON.stringify(favArray));
  }

  /**
   * Get array of page numbers for pagination display
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Refresh products (reload current page)
   */
  refresh(): void {
    this.loadProducts();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedCategory = 'All Products';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadProducts();
  }
}