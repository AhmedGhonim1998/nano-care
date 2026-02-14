import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ProductComponent } from './pages/products/products.component'; // FIXED: Changed from ProductsComponent to ProductComponent
import { ContactComponent } from './pages/contact/contact.component';
import { ProductdetailsComponent } from './pages/productdetails/productdetails.component';
import { CartComponent } from './pages/cart/cart.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductComponent }, // FIXED: Changed from ProductsComponent to ProductComponent
  { path: 'products/:id', component: ProductdetailsComponent }, // Moved before cart for proper routing priority
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' } // ADDED: Wildcard route for 404 handling
];