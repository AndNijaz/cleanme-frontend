import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authExcludedPaths = ['/api/auth/login', '/api/auth/register'];

    if (authExcludedPaths.some((path) => req.url.includes(path))) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');

    if (token && token !== 'null' && token !== 'undefined') {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
