# 🚀 CleanMe Frontend - Quick Reference

> **Essential commands, patterns, and shortcuts for CleanMe developers**

## ⚡ Quick Commands

```bash
# Development
npm start                    # Start dev server (localhost:4200)
npm run build               # Production build
npm run test               # Run unit tests
npm run lint               # Code linting

# Advanced
npm run build:staging      # Staging build
npm run analyze           # Bundle analyzer
npm run type-check        # TypeScript validation
```

## 🏗️ Project Structure

```
src/app/
├── 🏛️ core/              # Services, guards, interceptors
├── 🎭 features/          # Feature modules (auth, dashboard, user, cleaner)
├── 🔧 shared/            # Reusable components (19 components)
└── 🌍 environments/      # Environment configs
```

## 🔧 Essential Patterns

### Component Creation

```typescript
@Component({
  selector: "app-my-component",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- template -->`,
  styles: [
    `
      /* styles */
    `,
  ],
})
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Subscribe with cleanup
    this.service
      .getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Service Pattern

```typescript
@Injectable({ providedIn: "root" })
export class MyService {
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient) {}

  getData(): Observable<any[]> {
    return this.http.get<any[]>("/api/data").pipe(
      tap((data) => this.dataSubject.next(data)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error("Error:", error);
    return throwError(error);
  }
}
```

## 🎨 UI Patterns

### Responsive Grid

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div *ngFor="let item of items; trackBy: trackById" class="card">{{ item.name }}</div>
</div>
```

### Loading States

```html
<div *ngIf="loading$ | async" class="flex justify-center p-8">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>

<div *ngIf="!(loading$ | async) && (data$ | async) as data">
  <!-- Content -->
</div>
```

### Button Styles

```html
<!-- Primary Button -->
<button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Primary Action</button>

<!-- Secondary Button -->
<button class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">Secondary Action</button>
```

## 🔄 State Management

### Simple State Service

```typescript
@Injectable({ providedIn: "root" })
export class StateService {
  private state = new BehaviorSubject({ loading: false, data: null, error: null });

  // Selectors
  get loading$() {
    return this.state.pipe(map((s) => s.loading));
  }
  get data$() {
    return this.state.pipe(map((s) => s.data));
  }
  get error$() {
    return this.state.pipe(map((s) => s.error));
  }

  // Actions
  setLoading(loading: boolean) {
    this.updateState({ loading });
  }

  private updateState(partial: any) {
    this.state.next({ ...this.state.value, ...partial });
  }
}
```

## 🔒 Authentication

### Route Guard

```typescript
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(["/auth/login"]);
    return false;
  }
}
```

### HTTP Interceptor

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next.handle(req);
}
```

## 📡 API Integration

### Basic HTTP Service

```typescript
@Injectable({ providedIn: "root" })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }
}
```

## 🧪 Testing Shortcuts

### Component Test Setup

```typescript
describe("Component", () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });
});
```

### Service Test with Mock

```typescript
describe("Service", () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });
});
```

## 🎨 Styling Shortcuts

### Common Tailwind Classes

```css
/* Layout */
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

/* Typography */
.heading {
  @apply text-2xl font-bold text-gray-900;
}
.text-muted {
  @apply text-gray-600;
}

/* Buttons */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}
.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

/* States */
.loading {
  @apply opacity-50 pointer-events-none;
}
.error {
  @apply border-red-300 text-red-900 bg-red-50;
}
```

## 🚀 Performance Tips

### Optimization Checklist

- ✅ Use `OnPush` change detection
- ✅ Implement `trackBy` for `*ngFor`
- ✅ Lazy load feature modules
- ✅ Unsubscribe in `ngOnDestroy`
- ✅ Use `async` pipe when possible
- ✅ Optimize bundle size

### TrackBy Function

```typescript
trackByFn(index: number, item: any): any {
  return item.id || index;
}
```

## 🔍 Debugging

### Common Debug Commands

```typescript
// In component
console.log('Current state:', this.data);

// In template
{{ data | json }}

// In service
.pipe(tap(data => console.log('API response:', data)))
```

### Browser DevTools

- **Angular DevTools**: Inspect component tree
- **Network Tab**: Monitor API calls
- **Console**: Check for errors
- **Performance Tab**: Analyze bundle size

## 📦 Key Dependencies

```json
{
  "@angular/core": "^19.2.0",
  "@angular/common": "^19.2.0",
  "@angular/router": "^19.2.0",
  "@angular/forms": "^19.2.0",
  "rxjs": "~7.8.0",
  "tailwindcss": "^4.1.1"
}
```

## 🌐 Environment Variables

```typescript
// environment.ts
export const environment = {
  production: false,
  apiBaseUrl: "http://localhost:8080/api",
};
```

## 🔗 Useful Links

- [Angular Docs](https://angular.io/docs)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Keep this handy! 📌**
