# CleanMe Frontend Documentation

A modern Angular application for connecting cleaning service providers with clients. This frontend provides a comprehensive platform for cleaners to manage their services, availability, and bookings.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v19.2.4)

### Installation

```bash
npm install
```

### Development Server

```bash
ng serve
# or
npm start
```

Navigate to `http://localhost:4200/` for development.

### Production Build

```bash
ng build --prod
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                    # Core module (services, guards, interceptors)
│   │   └── services/           # Application services
│   │       ├── auth.service.ts          # Authentication & user management
│   │       └── cleaner-service.service.ts # Cleaner profile & data management
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication features
│   │   └── cleaner/           # Cleaner-specific features
│   │       ├── cleaner-services/        # Service management component
│   │       ├── cleaner-availability/    # Availability management
│   │       └── cleaner-dashboard/       # Cleaner dashboard
│   ├── shared/                # Shared components and utilities
│   │   └── constants/         # Application constants
│   │       └── services.constant.ts     # Predefined services configuration
│   └── environments/          # Environment configurations
```

## 🧹 Cleaner Services Feature

### Overview

The Cleaner Services feature allows cleaning professionals to:

- Select from predefined cleaning services
- Customize service descriptions
- Set hourly rates
- Manage service availability
- Save and update their service offerings

### Components

#### CleanerServicesComponent

**Location:** `src/app/features/cleaner/cleaner-services/`

**Purpose:** Main component for managing cleaner services

**Key Features:**

- ✅ Service selection from predefined options
- ✅ Custom service descriptions
- ✅ Hourly rate configuration
- ✅ Real-time toast notifications
- ✅ Responsive design with modern UI
- ✅ Auto-save functionality

**Template Structure:**

- Header with save button
- Loading states
- Selected services display
- Available services selection
- Service descriptions editor
- Pricing configuration
- Toast notifications

**Component Properties:**

```typescript
export class CleanerServicesComponent implements OnInit {
  predefinedServices = PREDEFINED_SERVICES;
  selectedServices: string[] = [];
  availableServices: ServiceType[] = [];
  serviceDescriptions: ServiceDescription[] = [];
  hourlyRate: number = 25;

  initialLoading = true;
  isLoading = false;
  successMessage = "";
  errorMessage = "";
  showAddServices = false;
}
```

**Key Methods:**

- `toggleService(serviceName: string)` - Add/remove services
- `saveServices()` - Save changes to backend
- `updateServiceDescription()` - Update custom descriptions
- `showToast()` - Display notifications

### Services

#### AuthService

**Location:** `src/app/core/services/auth.service.ts`

**Purpose:** Handles authentication and user management

**Key Methods:**

```typescript
// Authentication
register(data: RegisterRequest): Observable<AuthResponse>
login(data: LoginRequest): Observable<AuthResponse>

// Cleaner Management
setupCleaner(data: CleanerSetupRequest): Observable<void>
updateCleaner(cleanerId: string, data: any): Observable<void>

// Storage Management
saveAuthData(res: AuthResponse): void
getAuthData(): AuthResponse | null
clearAuthData(): void
isLoggedIn(): boolean
```

**HTTP Headers:**

- Automatically includes JWT token in Authorization header
- Content-Type: application/json

#### CleanerService

**Location:** `src/app/core/services/cleaner-service.service.ts`

**Purpose:** Manages cleaner profile data and operations

**Key Methods:**

```typescript
getCleanerPublicProfile(cleanerId: string): Observable<PublicCleanerProfile>
getCleaners(): Observable<CleanerCardModel[]>
getCleanerCardById(id: string): Observable<CleanerCardModel | null>
```

**Interfaces:**

```typescript
interface PublicCleanerProfile {
  fullName: string;
  address: string;
  bio: string;
  zones: string[];
  hourlyRate: number;
  minHours: number;
  rating: number;
  reviewCount: number;
  ratingLabel: string;
  availability?: { [day: string]: { from: string; to: string } }[];
  services: {
    icon: string;
    name: string;
    description: string;
  }[];
}

interface CleanerCardModel {
  id: string;
  fullName: string;
  rating: number;
  reviewCount: number;
  location: string;
  shortBio: string;
  services: string[];
  price: number;
  currency: string;
  isFavorite?: boolean;
}
```

### Constants

#### Predefined Services

**Location:** `src/app/shared/constants/services.constant.ts`

**Available Services:**

1. **Deep House Cleaning** 🧹

   - **ID:** `deep-house-cleaning`
   - **Description:** Comprehensive deep cleaning service including all rooms, dusting, vacuuming, mopping, kitchen deep clean, bathroom sanitization, and thorough window cleaning
   - **Short Description:** Complete deep cleaning of all rooms and surfaces

2. **Office Cleaning** 🏢

   - **ID:** `office-cleaning`
   - **Description:** Professional office cleaning including workspace sanitization, trash removal, floor cleaning, desk organization, and common area maintenance
   - **Short Description:** Professional workspace cleaning and sanitization

3. **Window Cleaning** 🪟

   - **ID:** `window-cleaning`
   - **Description:** Professional window cleaning service for interior and exterior windows, including frames, sills, and glass surfaces for crystal clear results
   - **Short Description:** Interior and exterior window cleaning service

4. **Floor Cleaning** 🧽
   - **ID:** `floor-cleaning`
   - **Description:** Specialized floor cleaning service for all floor types including hardwood, tile, carpet, and laminate with appropriate cleaning methods and products
   - **Short Description:** Specialized cleaning for all floor types

**Service Interface:**

```typescript
interface ServiceType {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  description: string;
  shortDescription: string;
}
```

### Data Flow

```
User Action → Component → Service → Backend API → Database
     ↓            ↓         ↓          ↓            ↓
Toast Notify ← Update UI ← Response ← HTTP ← Data Storage
```

**Detailed Flow for Service Management:**

1. User selects service → `toggleService()` called
2. Component updates `selectedServices` array
3. UI updates to show/hide service in lists
4. Toast notification displayed
5. User clicks "Save Changes" → `saveServices()` called
6. Component validates data and shows loading state
7. `AuthService.updateCleaner()` makes HTTP PUT request
8. Backend updates cleaner details in database
9. Success/error response handled with toast notification

## 🎨 UI/UX Features

### Design System

- **Framework:** Tailwind CSS with custom configurations
- **Components:** Standalone Angular components
- **Icons:** Heroicons (SVG-based)
- **Typography:** System fonts with gradient text effects
- **Colors:** Blue and indigo gradients with semantic colors

### Toast Notification System

**Implementation:**

```typescript
private showToast(message: string, type: 'success' | 'error' | 'info') {
  if (type === 'success') {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => (this.successMessage = ''), 3000);
  } else if (type === 'error') {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => (this.errorMessage = ''), 5000);
  } else if (type === 'info') {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => (this.successMessage = ''), 2000);
  }
}
```

**Features:**

- **Success** - Green border, checkmark icon (3s duration)
- **Error** - Red border, warning icon (5s duration)
- **Info** - Green border, checkmark icon (2s duration)
- **Position:** Fixed top-right corner (z-index: 50)
- **Animation:** Slide-in from right with CSS keyframes
- **Manual Dismiss:** X button for immediate closure

**CSS Animation:**

```css
@keyframes slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

### Responsive Design

- **Mobile-first** approach with Tailwind breakpoints
- **Grid layouts** for service cards (1 column mobile, 2 columns desktop)
- **Flexible** containers with max-width constraints
- **Touch-friendly** buttons with hover effects
- **Gradient backgrounds** for visual appeal

### Component States

- **Loading State** - Spinner animation during initial load
- **Empty State** - Illustrated message when no services selected
- **Error State** - User-friendly error messages with retry options
- **Success State** - Confirmation messages with icons

## 🔐 Authentication Flow

### User Registration Flow

1. User navigates to `/auth/register`
2. Fills registration form with user details
3. `AuthService.register()` sends POST to `/auth/register`
4. Backend validates and creates user account
5. JWT token returned and stored in localStorage
6. User automatically logged in and redirected

### Cleaner Setup Flow

1. After registration, cleaner redirected to setup page
2. User selects services from predefined list
3. Sets hourly rate (5-200 BAM validation)
4. Optionally adds custom service descriptions
5. `AuthService.setupCleaner()` sends POST to `/auth/cleaner-setup`
6. Backend creates cleaner profile
7. Success notification and redirect to dashboard

### Profile Management Flow

1. Existing cleaner navigates to services page
2. `CleanerService.getCleanerPublicProfile()` loads current data
3. User can add/remove services dynamically
4. Real-time UI updates with toast feedback
5. `AuthService.updateCleaner()` saves changes
6. Backend updates existing cleaner profile

### Token Management

- **Storage:** localStorage with keys: `token`, `userId`, `userType`, etc.
- **Headers:** Automatic inclusion in API requests
- **Validation:** JWT token checked for authentication
- **Expiration:** Handled with appropriate error responses

## 📡 API Integration

### Base URL Configuration

```typescript
// environment.ts
export const environment = {
  NG_APP_BASE_URL: "http://localhost:8080",
};
```

### Endpoints Used

#### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/cleaner-setup` - Initial cleaner profile setup

#### Cleaner Management Endpoints

- `GET /cleaners/{id}` - Get cleaner profile by ID
- `PUT /cleaners/{id}` - Update cleaner details
- `GET /cleaners` - Get all cleaners list

### Request/Response Formats

**Update Cleaner Request:**

```typescript
interface CleanerUpdateRequest {
  servicesOffered: string; // "Service 1, Service 2, Service 3"
  hourlyRate: number; // Rate in BAM (5-200)
  bio: string[]; // ["Service 1: Description", "Service 2: Description"]
  availability?: object[]; // Optional availability data
}
```

**Cleaner Profile Response:**

```typescript
interface CleanerDetailsDto {
  id: string; // UUID
  firstName: string;
  lastName: string;
  email: string;
  servicesOffered: string; // Comma-separated service names
  hourlyRate: number; // BigDecimal from backend
  availability: object[]; // Array of availability maps
  bio: string[]; // Array of bio entries
}
```

**Error Response Handling:**

- `404` - Cleaner profile not found (normal for new users)
- `403` - Authentication required or insufficient permissions
- `400` - Bad request (validation errors)
- `500` - Server errors with user-friendly messages

## 🔧 Development Guidelines

### Code Style and Standards

#### TypeScript Configuration

- **Strict mode** enabled for type safety
- **ES2022** target for modern JavaScript features
- **Module resolution** set to node
- **Source maps** enabled for debugging

#### Component Architecture

```typescript
@Component({
  selector: "app-component-name",
  standalone: true, // Standalone components
  imports: [CommonModule, FormsModule],
  templateUrl: "./component.html",
  styles: [
    `
      /* component-specific styles */
    `,
  ],
})
export class ComponentNameComponent implements OnInit {
  // Public properties first
  public property: string = "";

  // Private properties with underscore prefix
  private _cleanerId: string = "";

  constructor(private service: ServiceName, private authService: AuthService) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  // Public methods
  public publicMethod(): void {
    // Implementation
  }

  // Private methods
  private initializeComponent(): void {
    // Implementation
  }
}
```

#### Service Pattern

```typescript
@Injectable({ providedIn: "root" })
export class ServiceName {
  private readonly BASE_URL = `${environment.NG_APP_BASE_URL}/endpoint`;

  constructor(private http: HttpClient) {}

  // Public API methods
  public getData(): Observable<DataType> {
    return this.http.get<DataType>(this.BASE_URL).pipe(map(this.transformData), catchError(this.handleError));
  }

  // Private helper methods
  private transformData(data: any): DataType {
    // Transformation logic
  }

  private handleError(error: any): Observable<never> {
    // Error handling
    throw error;
  }
}
```

### Error Handling Best Practices

#### Component Level

```typescript
// Service call with error handling
this.service.getData().subscribe({
  next: (data) => {
    // Success handling
    this.showToast("Data loaded successfully", "success");
  },
  error: (error) => {
    // Error handling
    if (error.status === 404) {
      // Handle not found
    } else {
      this.showToast("Failed to load data", "error");
    }
  },
});
```

#### Service Level

```typescript
// HTTP error handling with operator
getData(): Observable<DataType> {
  return this.http.get<DataType>(this.url).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 404) {
        // Specific handling for not found
        return throwError(() => new Error('Resource not found'));
      }
      return throwError(() => error);
    })
  );
}
```

### Testing Guidelines

#### Unit Testing with Jasmine/Karma

```typescript
describe("CleanerServicesComponent", () => {
  let component: CleanerServicesComponent;
  let fixture: ComponentFixture<CleanerServicesComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj("AuthService", ["getAuthData", "updateCleaner"]);

    await TestBed.configureTestingModule({
      imports: [CleanerServicesComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CleanerServicesComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should toggle service selection", () => {
    const serviceName = "Deep House Cleaning";
    component.toggleService(serviceName);
    expect(component.selectedServices).toContain(serviceName);
  });
});
```

#### Service Testing

```typescript
describe("AuthService", () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should update cleaner successfully", () => {
    const cleanerId = "test-id";
    const updateData = { servicesOffered: "Test Service", hourlyRate: 25 };

    service.updateCleaner(cleanerId, updateData).subscribe();

    const req = httpMock.expectOne(`${environment.NG_APP_BASE_URL}/cleaners/${cleanerId}`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(updateData);
  });
});
```

## 🚨 Error Handling

### Frontend Error Management

#### HTTP Error Interceptor

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle unauthorized
          this.authService.clearAuthData();
          this.router.navigate(["/auth/login"]);
        }
        return throwError(() => error);
      })
    );
  }
}
```

#### Component Error Handling

```typescript
// Graceful error handling in components
loadData(): void {
  this.isLoading = true;
  this.service.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.isLoading = false;
    },
    error: (error) => {
      this.isLoading = false;
      if (error.status === 404) {
        this.showToast('No data found', 'info');
      } else {
        this.showToast('Failed to load data', 'error');
      }
    }
  });
}
```

### Common Error Scenarios

1. **Authentication Errors (401/403)**

   - Clear stored tokens
   - Redirect to login page
   - Show authentication required message

2. **Not Found Errors (404)**

   - For cleaner profiles: Normal for new users
   - Show appropriate empty state
   - Provide setup instructions

3. **Validation Errors (400)**

   - Display field-specific error messages
   - Highlight invalid form fields
   - Prevent form submission

4. **Server Errors (500)**
   - Show generic error message
   - Provide retry option
   - Log error for debugging

## 📱 Browser Support and Compatibility

### Supported Browsers

- **Chrome** 90+ (Primary target)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced features require modern browser support
- Responsive design for all screen sizes
- Touch-friendly interface for mobile devices

### Performance Optimizations

- **Lazy loading** for feature modules
- **OnPush** change detection strategy
- **Tree shaking** for unused code removal
- **AOT compilation** for smaller bundles
- **Service workers** for offline functionality (future)

## 🚀 Build and Deployment

### Development Build

```bash
ng serve
# Serves on http://localhost:4200
# Hot reload enabled
# Source maps included
```

### Production Build

```bash
ng build --configuration production
# Output to dist/ directory
# Minified and optimized
# Source maps excluded
```

### Environment Configuration

#### Development Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  NG_APP_BASE_URL: "http://localhost:8080",
};
```

#### Production Environment

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  NG_APP_BASE_URL: "https://api.cleanme.com",
};
```

### Build Optimizations

- **Bundle size analysis** with webpack-bundle-analyzer
- **Code splitting** for better loading performance
- **Compression** with gzip
- **CDN integration** for static assets

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] SSL certificates installed
- [ ] CORS configuration verified
- [ ] Error tracking enabled
- [ ] Performance monitoring setup

## 📋 Future Enhancements

### Planned Features

#### Short Term (Next Release)

- [ ] Service category filtering and search
- [ ] Advanced availability calendar scheduling
- [ ] Real-time notifications with WebSocket
- [ ] Cleaner profile photo upload
- [ ] Service rating and review system

#### Medium Term (Next Quarter)

- [ ] Multi-language support (i18n)
- [ ] Dark mode theme toggle
- [ ] Progressive Web App (PWA) features
- [ ] Offline functionality with service workers
- [ ] Advanced analytics dashboard

#### Long Term (Next Year)

- [ ] Mobile application (Ionic/React Native)
- [ ] Video call integration for consultations
- [ ] AI-powered service recommendations
- [ ] Integration with payment gateways
- [ ] Advanced booking management system

### Technical Improvements

#### Architecture Enhancements

- [ ] State management with NgRx for complex state
- [ ] Micro-frontend architecture for scalability
- [ ] GraphQL integration for efficient data fetching
- [ ] Server-side rendering (SSR) for better SEO

#### Testing and Quality

- [ ] Comprehensive unit test coverage (>90%)
- [ ] Automated end-to-end testing with Cypress
- [ ] Visual regression testing
- [ ] Performance testing and monitoring
- [ ] Accessibility compliance (WCAG 2.1 AA)

#### Developer Experience

- [ ] Storybook for component documentation
- [ ] Automated code generation tools
- [ ] CI/CD pipeline improvements
- [ ] Docker containerization
- [ ] Development environment automation

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch from `develop`
3. **Follow** coding standards and conventions
4. **Write** unit tests for new features
5. **Update** documentation
6. **Submit** pull request for review

### Code Review Guidelines

- **Functionality** - Does it work as expected?
- **Performance** - Is it optimized for performance?
- **Security** - Are there any security concerns?
- **Maintainability** - Is the code clean and readable?
- **Testing** - Are there adequate tests?

### Commit Message Convention

```
type(scope): description

feat(services): add service filtering functionality
fix(auth): resolve token expiration handling
docs(readme): update installation instructions
test(components): add unit tests for cleaner services
```

## 📞 Support and Resources

### Getting Help

- **Documentation:** This file and inline code comments
- **Issue Tracker:** GitHub Issues for bug reports and feature requests
- **Team Chat:** Slack channel for development discussions

### Useful Resources

- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**CleanMe Frontend** - Built with Angular 19, TypeScript, and Tailwind CSS for a modern, responsive cleaning service platform.
