import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(state.url);
  
  if (!token && !isPublicRoute) {
    // If no token and trying to access protected route, redirect to login
    router.navigate(['/login']);
    return false;
  }
  
  return true;
}; 