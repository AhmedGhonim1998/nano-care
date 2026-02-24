import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. بنجيب التوكن (تأكد إن الاسم مطابق للي في اللوجن)
  const token = localStorage.getItem('token'); 

  // 2. بنحدد هل الطلب رايح للـ API بتاعنا ولا لأ
  const isApiRequest = req.url.includes('/api/');

  // 3. لو فيه توكن والطلب رايح للـ API، بنضيف الهيدر
  if (token && isApiRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 4. بنبعت الطلب يكمل طريقه
  return next(req);
};