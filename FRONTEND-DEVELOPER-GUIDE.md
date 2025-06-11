# 🧹 CleanMe Frontend Developer Guide

> **A comprehensive guide for developers working on the CleanMe Angular frontend application**

## 🎯 Table of Contents

1. [🚀 Quick Start & Development](#-quick-start--development)
2. [🏗️ Architecture Deep Dive](#️-architecture-deep-dive)
3. [📦 Component Patterns](#-component-patterns)
4. [🔄 State Management](#-state-management)
5. [🎨 UI/UX Guidelines](#-uiux-guidelines)
6. [🔒 Security & Authentication](#-security--authentication)
7. [📡 API Integration Patterns](#-api-integration-patterns)
8. [🧪 Testing Strategy](#-testing-strategy)
9. [⚡ Performance Optimization](#-performance-optimization)
10. [🚀 Deployment & CI/CD](#-deployment--cicd)
11. [🛠️ Developer Tools & Workflow](#️-developer-tools--workflow)
12. [🐛 Debugging & Troubleshooting](#-debugging--troubleshooting)

---

## 🚀 Quick Start & Development

### Development Environment Setup

```bash
# Clone and setup
git clone <repository-url>
cd cleanme-frontend

# Install dependencies
npm ci

# Development server with hot reload
npm start

# Open application
# http://localhost:4200
```

### Essential VS Code Extensions

```json
{
  "recommendations": ["angular.ng-template", "bradlc.vscode-tailwindcss", "esbenp.prettier-vscode", "ms-vscode.vscode-typescript-next", "angular.ng-template"]
}
```

### Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: "http://localhost:8080/api",
  enableDevTools: true,
  logLevel: "debug",
};
```

---

## 🏗️ Architecture Deep Dive

### 📁 Project Structure Philosophy

```
src/app/
├── 🏛️ core/                    # Singleton services, guards, interceptors
│   ├── services/              # Business logic services
│   ├── guards/               # Route protection
│   └── interceptors/         # HTTP interceptors
├── 🎭 features/               # Feature modules (lazy-loaded)
│   ├── auth/                 # Authentication flow
│   ├── dashboard/            # User/Cleaner dashboards
│   ├── user/                 # Client-specific features
│   ├── cleaner/              # Cleaner-specific features
│   └── shared-profile/       # Shared profile components
├── 🔧 shared/                 # Reusable components & utilities
│   ├── components/           # UI components
│   └── constants/            # Application constants
└── 🌍 environments/           # Environment configurations
```

### 🎯 Architectural Patterns

#### 1. **Feature-Based Architecture**

```typescript
// Each feature is self-contained with clear boundaries
features/
├── auth/
│   ├── components/           # Feature-specific components
│   ├── services/            # Feature-specific services
│   └── models/              # Feature-specific interfaces
```

#### 2. **Shared Component Strategy**

```typescript
// Reusable UI components
shared/components/
├── platform-layout/         # Main application shell
├── booking-modal/          # Service booking interface
├── cleaner-card/           # Reusable cleaner display
└── notification-toast/     # User feedback system
```

#### 3. **Service Layer Pattern**

```typescript
// Core services for business logic
core/services/
├── auth.service.ts         # Authentication & user management
├── reservation.service.ts  # Booking operations
├── cleaner.service.ts     # Cleaner profile management
└── notification.service.ts # Toast notifications
```

---

## 📦 Component Patterns

### 🧩 Smart vs Presentational Components

#### Smart Components (Containers)

```typescript
@Component({
  selector: "app-user-dashboard",
  template: ` <app-cleaner-list [cleaners]="cleaners$ | async" [loading]="loading$ | async" (cleanerSelected)="onCleanerSelected($event)"> </app-cleaner-list> `,
})
export class UserDashboardComponent {
  cleaners$ = this.cleanerService.getCleaners();
  loading$ = this.cleanerService.loading$;

  constructor(private cleanerService: CleanerService) {}

  onCleanerSelected(cleaner: CleanerCardModel) {
    // Handle business logic
  }
}
```

#### Presentational Components

```typescript
@Component({
  selector: "app-cleaner-list",
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <app-cleaner-card *ngFor="let cleaner of cleaners" [cleaner]="cleaner" (selected)="onCleanerSelected(cleaner)"> </app-cleaner-card>
    </div>
  `,
})
export class CleanerListComponent {
  @Input() cleaners: CleanerCardModel[] = [];
  @Input() loading = false;
  @Output() cleanerSelected = new EventEmitter<CleanerCardModel>();

  onCleanerSelected(cleaner: CleanerCardModel) {
    this.cleanerSelected.emit(cleaner);
  }
}
```

### 🔄 Component Lifecycle Best Practices

```typescript
export class OptimizedComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Subscribe to observables with takeUntil for cleanup
    this.dataService
      .getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // Handle data
      });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## 🔄 State Management

### 📊 Service-Based State Pattern

```typescript
@Injectable({ providedIn: "root" })
export class CleanerStateService {
  private cleanersSubject = new BehaviorSubject<CleanerCardModel[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly cleaners$ = this.cleanersSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();

  // State mutations
  setCleaners(cleaners: CleanerCardModel[]) {
    this.cleanersSubject.next(cleaners);
  }

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  // Computed observables
  get availableCleaners$() {
    return this.cleaners$.pipe(map((cleaners) => cleaners.filter((c) => c.isAvailable)));
  }
}
```

### 🎯 Error State Management

```typescript
interface ServiceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

@Injectable()
export class StatefulService<T> {
  private state$ = new BehaviorSubject<ServiceState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // State selectors
  get data$() {
    return this.state$.pipe(map((s) => s.data));
  }
  get loading$() {
    return this.state$.pipe(map((s) => s.loading));
  }
  get error$() {
    return this.state$.pipe(map((s) => s.error));
  }

  protected setState(partial: Partial<ServiceState<T>>) {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
```

---

## 🎨 UI/UX Guidelines

### 🌈 Design System with Tailwind CSS

#### Color Palette

```css
/* Primary Colors */
.text-primary-blue {
  @apply text-blue-600;
}
.bg-primary-blue {
  @apply bg-blue-600;
}

/* Success & Status */
.text-success {
  @apply text-green-600;
}
.text-warning {
  @apply text-yellow-600;
}
.text-error {
  @apply text-red-600;
}

/* Neutral Grays */
.text-gray-primary {
  @apply text-gray-800;
}
.text-gray-secondary {
  @apply text-gray-600;
}
.bg-gray-light {
  @apply bg-gray-50;
}
```

#### Component Styling Patterns

```typescript
// Consistent button styles
@Component({
  template: `
    <button class="btn btn-primary" [class.btn-loading]="loading" [disabled]="loading">
      <span *ngIf="loading" class="loading-spinner"></span>
      {{ label }}
    </button>
  `,
  styles: [
    `
      .btn {
        @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
      }
      .btn-primary {
        @apply bg-blue-600 text-white hover:bg-blue-700;
      }
      .btn-loading {
        @apply opacity-75 cursor-not-allowed;
      }
    `,
  ],
})
export class ButtonComponent {}
```

### 📱 Responsive Design Patterns

```typescript
// Mobile-first responsive grid
@Component({
  template: `
    <div class="responsive-grid">
      <div *ngFor="let item of items" class="grid-item">
        {{ item.name }}
      </div>
    </div>
  `,
  styles: [
    `
      .responsive-grid {
        @apply grid gap-4;
        @apply grid-cols-1; /* Mobile */
        @apply md:grid-cols-2; /* Tablet */
        @apply lg:grid-cols-3; /* Desktop */
        @apply xl:grid-cols-4; /* Large Desktop */
      }
    `,
  ],
})
export class ResponsiveGridComponent {}
```

### ✨ Animation & Transitions

```typescript
@Component({
  animations: [trigger("slideIn", [transition(":enter", [style({ transform: "translateX(100%)", opacity: 0 }), animate("300ms ease-out", style({ transform: "translateX(0)", opacity: 1 }))])]), trigger("fadeInOut", [transition(":enter", [style({ opacity: 0 }), animate("200ms ease-in", style({ opacity: 1 }))]), transition(":leave", [animate("200ms ease-out", style({ opacity: 0 }))])])],
})
export class AnimatedComponent {}
```

---

## 🔒 Security & Authentication

### 🔐 JWT Token Management

```typescript
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "user_data";

  // Token operations
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // User session management
  saveAuthData(response: AuthResponse): void {
    this.saveToken(response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }

  // Security checks
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
```

### 🛡️ Route Guards

```typescript
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Role-based access control
      const userRole = this.authService.getUserRole();
      const requiredRole = route.data["role"];

      if (requiredRole && userRole !== requiredRole) {
        this.router.navigate(["/unauthorized"]);
        return false;
      }

      return true;
    }

    this.router.navigate(["/auth/login"]);
    return false;
  }
}
```

### 🔐 HTTP Interceptors

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return next.handle(authReq).pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.authService.logout();
          }
          return throwError(error);
        })
      );
    }

    return next.handle(req);
  }
}
```

---

## 📡 API Integration Patterns

### 🌐 HTTP Service Base Class

```typescript
export abstract class BaseApiService {
  protected apiUrl = environment.apiBaseUrl;

  constructor(protected http: HttpClient) {}

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`).pipe(retry(2), catchError(this.handleError));
  }

  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = "An error occurred";

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
```

### 📊 Real-time Updates Pattern

```typescript
@Injectable({ providedIn: "root" })
export class ReservationService extends BaseApiService {
  private reservationsSubject = new BehaviorSubject<ReservationDto[]>([]);
  public reservations$ = this.reservationsSubject.asObservable();

  // Polling for updates
  startPolling(interval = 30000) {
    return timer(0, interval).pipe(
      switchMap(() => this.getAllReservations()),
      tap((reservations) => this.reservationsSubject.next(reservations))
    );
  }

  // Optimistic updates
  updateReservationOptimistic(id: string, updates: Partial<ReservationDto>) {
    const current = this.reservationsSubject.value;
    const optimistic = current.map((r) => (r.id === id ? { ...r, ...updates } : r));

    this.reservationsSubject.next(optimistic);

    // Sync with server
    return this.updateReservation(id, updates).pipe(
      catchError((error) => {
        // Revert on error
        this.reservationsSubject.next(current);
        return throwError(error);
      })
    );
  }
}
```

---

## 🧪 Testing Strategy

### 🔬 Unit Testing Patterns

```typescript
describe("CleanerService", () => {
  let service: CleanerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CleanerService],
    });

    service = TestBed.inject(CleanerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should fetch cleaners", () => {
    const mockCleaners: CleanerCardModel[] = [{ id: "1", fullName: "Test Cleaner", rating: 5 }];

    service.getCleaners().subscribe((cleaners) => {
      expect(cleaners).toEqual(mockCleaners);
    });

    const req = httpMock.expectOne("/api/cleaners");
    expect(req.request.method).toBe("GET");
    req.flush(mockCleaners);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### 🎭 Component Testing

```typescript
describe("CleanerCardComponent", () => {
  let component: CleanerCardComponent;
  let fixture: ComponentFixture<CleanerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CleanerCardComponent],
      providers: [{ provide: CleanerService, useValue: jasmine.createSpyObj("CleanerService", ["addToFavorites"]) }],
    }).compileComponents();

    fixture = TestBed.createComponent(CleanerCardComponent);
    component = fixture.componentInstance;

    component.cleaner = {
      id: "1",
      fullName: "Test Cleaner",
      rating: 5,
      services: ["House Cleaning"],
    };

    fixture.detectChanges();
  });

  it("should display cleaner information", () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".cleaner-name").textContent).toContain("Test Cleaner");
    expect(compiled.querySelector(".rating").textContent).toContain("5");
  });

  it("should emit selection event when hire button clicked", () => {
    spyOn(component.selected, "emit");

    const hireButton = fixture.nativeElement.querySelector(".hire-button");
    hireButton.click();

    expect(component.selected.emit).toHaveBeenCalledWith(component.cleaner);
  });
});
```

---

## ⚡ Performance Optimization

### 🚀 Bundle Optimization

```typescript
// Lazy loading modules
const routes: Routes = [
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "cleaner",
    loadChildren: () => import("./features/cleaner/cleaner.routes").then((m) => m.cleanerRoutes),
  },
];
```

### 📊 Change Detection Optimization

```typescript
@Component({
  selector: "app-cleaner-list",
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimize change detection
  template: `
    <div *ngFor="let cleaner of cleaners; trackBy: trackByCleaner">
      <app-cleaner-card [cleaner]="cleaner"></app-cleaner-card>
    </div>
  `,
})
export class CleanerListComponent {
  @Input() cleaners: CleanerCardModel[] = [];

  // Optimize *ngFor performance
  trackByCleaner(index: number, cleaner: CleanerCardModel): string {
    return cleaner.id;
  }
}
```

### 🔄 Observable Optimization

```typescript
@Injectable()
export class OptimizedService {
  // Cache API responses
  private cache = new Map<string, Observable<any>>();

  getCachedData(key: string): Observable<any> {
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        this.http.get(`/api/${key}`).pipe(
          shareReplay(1), // Cache and share result
          tap(() => {
            // Clear cache after 5 minutes
            setTimeout(() => this.cache.delete(key), 5 * 60 * 1000);
          })
        )
      );
    }
    return this.cache.get(key)!;
  }
}
```

---

## 🚀 Deployment & CI/CD

### 📦 Build Configuration

```json
{
  "scripts": {
    "build:prod": "ng build --configuration production",
    "build:staging": "ng build --configuration staging",
    "analyze": "ng build --stats-json && npx webpack-bundle-analyzer dist/cleanme/stats.json"
  }
}
```

### 🌐 Environment Management

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: "https://api.cleanme.app",
  enableDevTools: false,
  logLevel: "error",
};
```

### 🔄 Netlify Deployment

```toml
# netlify.toml
[build]
  publish = "dist/cleanme"
  command = "npm run build:prod"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## 🛠️ Developer Tools & Workflow

### 🔧 VS Code Configuration

```json
{
  "angular.experimental-ivy": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "emmet.includeLanguages": {
    "typescript": "html"
  },
  "files.associations": {
    "*.html": "angular"
  }
}
```

### 📋 Code Quality Tools

```json
{
  "scripts": {
    "lint": "ng lint",
    "format": "prettier --write \"src/**/*.{ts,html,scss}\"",
    "type-check": "tsc --noEmit"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,html}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 🐛 Debugging & Troubleshooting

### 🔍 Common Issues & Solutions

#### 1. **CORS Issues**

```typescript
// proxy.conf.json for development
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

#### 2. **Memory Leaks Prevention**

```typescript
// Always unsubscribe
export class ComponentWithSubscriptions implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.service.getData().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### 3. **Bundle Size Issues**

```bash
# Analyze bundle
npm run analyze

# Check for large dependencies
npx bundle-phobia [package-name]
```

### 📊 Performance Monitoring

```typescript
// Custom performance monitoring
@Injectable({ providedIn: "root" })
export class PerformanceService {
  measureApiCall<T>(apiCall: Observable<T>, operationName: string): Observable<T> {
    const startTime = performance.now();

    return apiCall.pipe(
      tap(() => {
        const duration = performance.now() - startTime;
        console.log(`API ${operationName} took ${duration.toFixed(2)}ms`);
      })
    );
  }
}
```

---

## 🎉 Best Practices Summary

### ✅ Do's

- Use OnPush change detection strategy
- Implement proper error handling
- Follow reactive patterns with RxJS
- Write unit tests for business logic
- Use TypeScript strict mode
- Implement proper loading states
- Cache API responses when appropriate
- Use trackBy functions with \*ngFor

### ❌ Don'ts

- Don't subscribe without unsubscribing
- Don't use `any` type
- Don't mutate component inputs
- Don't forget to handle loading/error states
- Don't ignore accessibility (a11y)
- Don't skip code reviews
- Don't deploy without testing

---

## 📚 Additional Resources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [RxJS Best Practices](https://rxjs.dev/guide/operators)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Angular Testing Guide](https://angular.io/guide/testing)

---

**Happy Coding! 🚀**

_This guide is a living document. Please contribute improvements and updates as the application evolves._
