# CleanMe Frontend - Cleaner Services Feature Documentation

## 📋 Overview

The Cleaner Services feature is a comprehensive Angular component that allows cleaning professionals to manage their service offerings, set pricing, and customize descriptions. This document covers the implementation, architecture, and usage of this feature.

## 🏗️ Architecture

### Component Structure

```
cleaner-services/
├── cleaner-services.component.ts      # Main component logic
├── cleaner-services.component.html    # Template with responsive UI
└── cleaner-services.component.spec.ts # Unit tests
```

### Dependencies

- **Angular Common Module** - For structural directives (*ngIf, *ngFor)
- **Angular Forms Module** - For two-way data binding with ngModel
- **AuthService** - For authentication and API calls
- **CleanerService** - For profile data management
- **Services Constants** - Predefined service definitions

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
- **Rate Recommendations**: Suggested range guidance

### ✅ Toast Notifications

- **Success Messages**: Green toasts for positive actions (3s duration)
- **Error Messages**: Red toasts for failures (5s duration)
- **Info Messages**: Blue toasts for information (2s duration)
- **Slide Animation**: Smooth slide-in from top-right corner

## 📡 API Integration

### Endpoints Used

```typescript
// Load existing services
GET /cleaners/{id} -> CleanerDetailsDto

// Save service changes
PUT /cleaners/{id} -> CleanerUpdateRequest
```

### Request Format

```typescript
interface CleanerUpdateRequest {
  servicesOffered: string; // "Deep House Cleaning, Office Cleaning"
  hourlyRate: number; // 25
  bio: string[]; // ["Deep House Cleaning: Custom description"]
}
```

### Response Format

```typescript
interface CleanerDetailsDto {
  id: string;
  firstName: string;
  lastName: string;
  servicesOffered: string; // Comma-separated services
  hourlyRate: number;
  bio: string[]; // Array of descriptions
}
```

## 🎨 UI/UX Design

### Responsive Layout

- **Mobile First**: Single column layout on mobile
- **Desktop Enhanced**: Two-column grid for service cards
- **Flexible Cards**: Auto-sizing with consistent spacing

### Visual Hierarchy

- **Gradient Headers**: Blue-to-indigo gradients for section headers
- **Color Coding**: Green for selected services, gray for available
- **Icon System**: Emoji-based service identification
- **Shadow Effects**: Subtle shadows for depth and professionalism

### Interactive Elements

- **Hover Effects**: Scale and shadow transitions on buttons
- **Loading States**: Spinner animations during API calls
- **Empty States**: Illustrated prompts when no services selected
- **Action Feedback**: Immediate visual response to user actions

## 🔧 Component Implementation

### Core Properties

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

### Key Methods

#### Service Toggle

```typescript
toggleService(serviceName: string) {
  const index = this.selectedServices.indexOf(serviceName);
  if (index > -1) {
    // Remove service
    this.selectedServices.splice(index, 1);
    this.serviceDescriptions = this.serviceDescriptions.filter(
      (desc) => desc.serviceName !== serviceName
    );
    this.showToast(`${serviceName} removed from your services`, 'info');
  } else {
    // Add service
    this.selectedServices.push(serviceName);
    this.serviceDescriptions.push({
      serviceName,
      customDescription: '',
    });
    this.showToast(`${serviceName} added to your services`, 'success');
  }
  this.updateAvailableServices();
}
```

#### Save Services

```typescript
saveServices() {
  // Validation
  if (this.selectedServices.length === 0) {
    this.errorMessage = 'Please select at least one service.';
    return;
  }

  if (this.hourlyRate < 5 || this.hourlyRate > 200) {
    this.errorMessage = 'Please set a valid hourly rate between 5 and 200 BAM.';
    return;
  }

  // Prepare request
  const servicesOffered = this.selectedServices.join(', ');
  const bio = this.serviceDescriptions
    .filter((desc) => desc.customDescription.trim())
    .map((desc) => `${desc.serviceName}: ${desc.customDescription}`)
    .join(', ');

  const request = {
    servicesOffered,
    hourlyRate: this.hourlyRate,
    bio: bio ? [bio] : [],
  };

  // API call
  this.authService.updateCleaner(this.cleanerId, request).subscribe({
    next: () => {
      this.isLoading = false;
      this.showToast('Services updated successfully! 🎉', 'success');
    },
    error: () => {
      this.isLoading = false;
      this.showToast('Failed to update services. Please try again.', 'error');
    },
  });
}
```

#### Toast Notifications

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

## 📊 Data Flow

### Initialization Flow

1. Component loads → `ngOnInit()` called
2. Get user ID from AuthService
3. Initialize available services array
4. Load existing cleaner profile
5. Parse services and descriptions
6. Update UI with loaded data

### Service Selection Flow

1. User clicks service card → `toggleService()` called
2. Service added/removed from arrays
3. UI updates with new service lists
4. Toast notification shown
5. Available services recalculated

### Save Flow

1. User clicks "Save Changes" → `saveServices()` called
2. Form validation performed
3. Loading state activated
4. Data formatted for API
5. HTTP PUT request sent
6. Success/error handling with toast
