# CleanMe Frontend - Services Feature Documentation

## 📋 Overview

The Cleaner Services feature is the core functionality that allows cleaning professionals to manage their service offerings, set pricing, and customize descriptions. Built with Angular 19 and TypeScript, it provides a modern, responsive interface for service management.

## 🎯 Key Features

### ✅ Service Selection

- **Predefined Services**: 4 professional cleaning services with emojis and descriptions
- **Dynamic UI**: Services move between "Available" and "Selected" sections
- **Real-time Updates**: Immediate visual feedback when adding/removing services

### ✅ Custom Descriptions

- **Service Personalization**: Add custom descriptions for each selected service
- **Bio Integration**: Descriptions stored in backend bio field
- **Default Fallbacks**: Professional default descriptions provided

### ✅ Pricing Management

- **Hourly Rate Setting**: Input validation (5-200 BAM range)
- **Currency Display**: BAM (Bosnian Convertible Mark) with proper formatting
- **Rate Recommendations**: Suggested range guidance (20-50 BAM/hour)

### ✅ Toast Notifications

- **Success Messages**: Green toasts for positive actions (3s duration)
- **Error Messages**: Red toasts for failures (5s duration)
- **Info Messages**: Blue toasts for information (2s duration)
- **Slide Animation**: Smooth slide-in from top-right corner

## 🏗️ Component Architecture

### File Structure

```
src/app/features/cleaner/cleaner-services/
├── cleaner-services.component.ts      # Main component logic
├── cleaner-services.component.html    # Responsive template
└── cleaner-services.component.spec.ts # Unit tests
```

### Key Dependencies

```typescript
// Core Angular modules
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

// Application services
import { CleanerService } from "../../../core/services/cleaner-service.service";
import { AuthService } from "../../../core/services/auth.service";

// Constants and types
import { PREDEFINED_SERVICES, ServiceType } from "../../../shared/constants/services.constant";
```

### Component Properties

```typescript
export class CleanerServicesComponent implements OnInit {
  // Service Management
  predefinedServices = PREDEFINED_SERVICES;
  selectedServices: string[] = [];
  availableServices: ServiceType[] = [];
  serviceDescriptions: ServiceDescription[] = [];

  // Configuration
  hourlyRate: number = 25;

  // UI State
  initialLoading = true;
  isLoading = false;
  showAddServices = false;

  // Notifications
  successMessage = "";
  errorMessage = "";
}
```

## 📊 Data Flow

### 1. Component Initialization

```typescript
ngOnInit() → initializeData() → loadCurrentServices()
```

1. Get user authentication data
2. Initialize available services array
3. Fetch existing cleaner profile from backend
4. Parse services and custom descriptions
5. Update UI with loaded data

### 2. Service Selection

```typescript
User clicks service → toggleService() → updateAvailableServices() → showToast()
```

1. User clicks on available service card
2. Service added to selectedServices array
3. Service removed from availableServices array
4. UI updates with new service distribution
5. Success toast notification displayed

### 3. Save Process

```typescript
Save button → saveServices() → authService.updateCleaner() → API response → toast notification
```

1. Validate form data (services count, hourly rate)
2. Format data for backend API
3. Send PUT request to update cleaner profile
4. Handle success/error responses
5. Display appropriate toast notification

## 📡 API Integration

### Endpoints Used

```typescript
// Load existing cleaner profile
GET /cleaners/{id} → CleanerDetailsDto

// Update cleaner services and pricing
PUT /cleaners/{id} → CleanerUpdateRequest
```

### Request Format

```typescript
interface CleanerUpdateRequest {
  servicesOffered: string; // "Deep House Cleaning, Office Cleaning"
  hourlyRate: number; // 25
  bio: string[]; // ["Deep House Cleaning: Custom description"]
}
```

### Response Handling

```typescript
// Success response
{
  id: "uuid",
  firstName: "John",
  lastName: "Doe",
  servicesOffered: "Deep House Cleaning, Office Cleaning",
  hourlyRate: 35,
  bio: ["Deep House Cleaning: Thorough cleaning service"]
}

// Error handling
- 404: No cleaner profile (normal for new users)
- 403: Authentication required
- 400: Validation errors
- 500: Server errors
```

## 🎨 UI/UX Implementation

### Responsive Design

```css
/* Mobile-first approach with Tailwind CSS */
.service-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

/* Card hover effects */
.service-card {
  @apply transition-all duration-200 hover:shadow-md hover:scale-105;
}
```

### Toast Notification System

```typescript
// CSS Animation
@keyframes slide-in {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

// Toast implementation
private showToast(message: string, type: 'success' | 'error' | 'info') {
  // Set message and auto-clear after timeout
  if (type === 'success') {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 3000);
  }
  // ... other types
}
```

### Color Scheme

- **Primary**: Blue gradient (from-blue-500 to-indigo-500)
- **Success**: Green (border-green-500, text-green-800)
- **Error**: Red (border-red-500, text-red-800)
- **Info**: Blue (same as success styling)
- **Background**: Gray gradient (from-gray-50 to-blue-50)

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe("CleanerServicesComponent", () => {
  let component: CleanerServicesComponent;
  let fixture: ComponentFixture<CleanerServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CleanerServicesComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CleanerService, useValue: mockCleanerService },
      ],
    }).compileComponents();
  });

  it("should toggle service selection", () => {
    const serviceName = "Deep House Cleaning";
    component.toggleService(serviceName);
    expect(component.selectedServices).toContain(serviceName);
  });

  it("should validate hourly rate range", () => {
    component.hourlyRate = 3; // Below minimum
    component.saveServices();
    expect(component.errorMessage).toContain("valid hourly rate");
  });
});
```

### Integration Tests

- Component-Service interaction
- API request/response handling
- Error scenario testing
- UI state management
- Toast notification behavior

## 🔧 Configuration

### Predefined Services

```typescript
// src/app/shared/constants/services.constant.ts
export const PREDEFINED_SERVICES: ServiceType[] = [
  {
    id: "deep-house-cleaning",
    name: "Deep House Cleaning",
    emoji: "🧹",
    description: "Comprehensive deep cleaning including all rooms...",
    shortDescription: "Complete deep cleaning of all rooms and surfaces",
  },
  // ... other services
];
```

### Environment Setup

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  NG_APP_BASE_URL: "http://localhost:8080",
};
```

## 🚨 Error Handling

### Frontend Error Management

```typescript
// Service error handling
loadCurrentServices() {
  this.cleanerService.getCleanerPublicProfile(this.cleanerId).subscribe({
    next: (profile) => {
      // Success handling
    },
    error: (error) => {
      if (error.status === 403 || error.status === 404) {
        // Normal for new users - handle gracefully
        this.selectedServices = [];
        this.updateAvailableServices();
        this.errorMessage = '';
      } else {
        // Show error toast for other errors
        this.showToast('Failed to load services. You can still set them up.', 'error');
      }
    }
  });
}
```

### Common Error Scenarios

1. **New User (404)**: No cleaner profile exists yet - handled gracefully
2. **Authentication (403)**: Token expired or invalid - redirect to login
3. **Validation (400)**: Invalid form data - show specific error messages
4. **Network (500)**: Server errors - show retry option

## 🚀 Performance Optimizations

### Memory Management

```typescript
// Implement OnDestroy for cleanup
export class CleanerServicesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Use takeUntil for subscription cleanup
  loadCurrentServices() {
    this.cleanerService.getCleanerPublicProfile(this.cleanerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({...});
  }
}
```

### Bundle Optimization

- **Tree Shaking**: Import only needed RxJS operators
- **Lazy Loading**: Component part of feature module
- **Standalone Components**: Better tree shaking and smaller bundles

## 🔍 Troubleshooting

### Common Issues

#### Services Not Loading

**Symptoms**: Empty service list, loading spinner persists
**Cause**: API endpoint returning 404 (no cleaner profile)
**Solution**: This is normal for new users and handled gracefully

#### Save Button Not Working

**Symptoms**: No response when clicking save
**Cause**: Form validation failing or network error
**Solution**: Check browser console for validation errors

#### Toast Notifications Not Showing

**Symptoms**: No feedback messages appear
**Solution**: Check CSS z-index and positioning classes

### Debug Mode

```typescript
// Enable debug logging
private debugMode = environment.production === false;

private debugLog(message: string, data?: any) {
  if (this.debugMode) {
    console.log(`[CleanerServices] ${message}`, data);
  }
}
```
