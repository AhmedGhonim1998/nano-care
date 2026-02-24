import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // نفس الاسم اللي بنخزن بيه

  if (token) {
    return true; // ادخل يا بطل
  } else {
    router.navigate(['/login']); // ارجع سجل دخول الأول
    return false;
  }
};