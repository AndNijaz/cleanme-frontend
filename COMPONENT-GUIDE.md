# 🧩 CleanMe Component Architecture Guide

> **Complete reference for all shared components and their usage patterns**

## 📊 Component Overview

The CleanMe frontend features **19 shared components** organized for maximum reusability and consistency across the application.

### 📁 Component Organization

```
src/app/shared/components/
├── 🏗️ Layout Components
│   ├── platform-layout/           # Main app shell
│   ├── platform-header/          # Navigation header
│   └── platform-sidebar/         # Dynamic sidebar
├── 🎯 UI Components
│   ├── cleaner-card/             # Cleaner display card
│   ├── booking-modal/            # Service booking interface
│   ├── review-modal/             # Rating and review system
│   └── notification-toast/       # User feedback
├── 📝 Form Components
│   ├── user-info/                # User profile form
│   ├── cleaner-info/             # Cleaner onboarding
│   └── service-reservation-one/  # Booking form
└── 🔄 Utility Components
    ├── booking-progress/         # Status indicators
    ├── leave-review-card/        # Review submission
    └── cleaner-public-profile/   # Profile display
```

---

## 🏗️ Layout Components

### PlatformLayoutComponent

**Purpose**: Main application shell with dynamic navigation and content area.

**Location**: `src/app/shared/components/platform-layout/`

**Features**:

- ✅ Role-based sidebar navigation
- ✅ Responsive design with mobile support
- ✅ Dynamic dashboard routing
- ✅ User session management

**Usage**:

```typescript
@Component({
  template: `
    <app-platform-layout>
      <router-outlet></router-outlet>
    </app-platform-layout>
  `,
})
export class AppComponent {}
```

**Props**: None (uses router and auth service internally)

**Navigation Structure**:

```typescript
// CLIENT Navigation
- Home → Landing page
- Dashboard → Cleaner discovery
- My Bookings → Reservation management
- Favorites → Saved cleaners
- Reviews → Rating history
- Profile → Account settings

// CLEANER Navigation
- Home → Landing page
- Dashboard → Job management
- My Jobs → Booking requests
- Services → Service configuration
- Profile → Business settings
```

---

### PlatformHeaderComponent

**Purpose**: Application header with user menu and notifications.

**Location**: `src/app/shared/components/platform-header/`

**Features**:

- ✅ User profile dropdown
- ✅ Notification bell with count
- ✅ Dynamic greeting based on user role
- ✅ Logout functionality

**Usage**:

```html
<app-platform-header [user]="currentUser" [notificationCount]="notifications.length" (logout)="handleLogout()" (profileClick)="navigateToProfile()"> </app-platform-header>
```

**Props**:

```typescript
interface HeaderProps {
  user: UserDto;
  notificationCount: number;
}

interface HeaderEvents {
  logout: () => void;
  profileClick: () => void;
}
```

---

## 🎯 UI Components

### CleanerCardComponent

**Purpose**: Reusable card for displaying cleaner information in grids and lists.

**Location**: `src/app/shared/components/cleaner-card/`

**Features**:

- ✅ Cleaner profile display
- ✅ Service tags
- ✅ Rating and review count
- ✅ Action buttons (Hire, Favorite)
- ✅ Responsive design

**Usage**:

```html
<app-cleaner-card [cleaner]="cleanerData" [showActions]="true" [isFavorite]="false" (selected)="onCleanerSelected($event)" (favoriteToggled)="onFavoriteToggle($event)"> </app-cleaner-card>
```

**Props**:

```typescript
interface CleanerCardProps {
  cleaner: CleanerCardModel;
  showActions: boolean;
  isFavorite: boolean;
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
}

interface CleanerCardEvents {
  selected: (cleaner: CleanerCardModel) => void;
  favoriteToggled: (cleanerId: string) => void;
}
```

**Styling**:

```css
.cleaner-card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
  @apply hover:shadow-lg transition-shadow duration-200;
}

.cleaner-actions {
  @apply flex gap-3 mt-4;
}

.hire-button {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md;
  @apply hover:bg-blue-700 transition-colors;
}
```

---

### BookingModalComponent

**Purpose**: Modal interface for service booking with time selection and details.

**Location**: `src/app/shared/components/booking-modal/`

**Features**:

- ✅ Time slot selection
- ✅ Service selection
- ✅ Location input with validation
- ✅ Special instructions field
- ✅ Booking confirmation

**Usage**:

```html
<app-booking-modal [isOpen]="showBookingModal" [cleaner]="selectedCleaner" [availableSlots]="timeSlots" (bookingSubmitted)="onBookingSubmitted($event)" (modalClosed)="onModalClosed()"> </app-booking-modal>
```

**Props**:

```typescript
interface BookingModalProps {
  isOpen: boolean;
  cleaner: CleanerCardModel;
  availableSlots: TimeSlot[];
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

interface BookingData {
  cleanerId: string;
  date: string;
  time: string;
  location: string;
  services: string[];
  comment: string;
}

interface BookingModalEvents {
  bookingSubmitted: (data: BookingData) => void;
  modalClosed: () => void;
}
```

---

### ReviewModalComponent

**Purpose**: Rating and review submission interface.

**Location**: `src/app/shared/components/review-modal/`

**Features**:

- ✅ 5-star rating system
- ✅ Written review text area
- ✅ Service quality indicators
- ✅ Submission validation

**Usage**:

```html
<app-review-modal [isOpen]="showReviewModal" [reservation]="completedReservation" [existingReview]="currentReview" (reviewSubmitted)="onReviewSubmitted($event)" (modalClosed)="onReviewModalClosed()"> </app-review-modal>
```

**Props**:

```typescript
interface ReviewModalProps {
  isOpen: boolean;
  reservation: ReservationDto;
  existingReview?: ReviewDto;
}

interface ReviewData {
  reservationId: string;
  cleanerId: string;
  rating: number; // 1-5
  comment: string;
  serviceQuality: number;
  punctuality: number;
  professionalism: number;
}

interface ReviewModalEvents {
  reviewSubmitted: (review: ReviewData) => void;
  modalClosed: () => void;
}
```

---

### NotificationToastComponent

**Purpose**: System-wide notification and feedback display.

**Location**: `src/app/shared/components/notification-toast/`

**Features**:

- ✅ Multiple toast types (success, error, warning, info)
- ✅ Auto-dismiss with configurable timeout
- ✅ Slide-in animations
- ✅ Action buttons

**Usage**:

```html
<app-notification-toast [message]="toastMessage" [type]="toastType" [duration]="3000" [showAction]="false" (dismissed)="onToastDismissed()" (actionClicked)="onToastAction()"> </app-notification-toast>
```

**Props**:

```typescript
interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration: number; // milliseconds
  showAction: boolean;
  actionText?: string;
}

interface ToastEvents {
  dismissed: () => void;
  actionClicked: () => void;
}
```

**Service Integration**:

```typescript
@Injectable({ providedIn: "root" })
export class NotificationService {
  private toastSubject = new Subject<ToastMessage>();
  public toast$ = this.toastSubject.asObservable();

  showSuccess(message: string, duration = 3000) {
    this.show(message, "success", duration);
  }

  showError(message: string, duration = 5000) {
    this.show(message, "error", duration);
  }

  private show(message: string, type: ToastType, duration: number) {
    this.toastSubject.next({ message, type, duration });
  }
}
```

---

## 📝 Form Components

### UserInfoComponent

**Purpose**: User profile management form for clients.

**Location**: `src/app/shared/components/user-info/`

**Features**:

- ✅ Personal information editing
- ✅ Profile picture upload
- ✅ Address management
- ✅ Validation and error handling

**Usage**:

```html
<app-user-info [user]="currentUser" [loading]="isUpdating" (userUpdated)="onUserUpdated($event)" (imageUploaded)="onImageUploaded($event)"> </app-user-info>
```

**Props**:

```typescript
interface UserInfoProps {
  user: UserDto;
  loading: boolean;
}

interface UserUpdateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}

interface UserInfoEvents {
  userUpdated: (data: UserUpdateData) => void;
  imageUploaded: (file: File) => void;
}
```

---

### CleanerInfoComponent

**Purpose**: Cleaner onboarding and profile setup form.

**Location**: `src/app/shared/components/cleaner-info/`

**Features**:

- ✅ Business information setup
- ✅ Service selection and pricing
- ✅ Availability configuration
- ✅ Bio and description

**Usage**:

```html
<app-cleaner-info [cleaner]="cleanerProfile" [isFirstTime]="isNewCleaner" [loading]="isUpdating" (cleanerUpdated)="onCleanerUpdated($event)" (setupCompleted)="onSetupCompleted()"> </app-cleaner-info>
```

**Props**:

```typescript
interface CleanerInfoProps {
  cleaner: CleanerDto;
  isFirstTime: boolean;
  loading: boolean;
}

interface CleanerUpdateData {
  bio: string;
  servicesOffered: string[];
  hourlyRate: number;
  minHours: number;
  zones: string[];
  availability: AvailabilitySchedule;
}

interface CleanerInfoEvents {
  cleanerUpdated: (data: CleanerUpdateData) => void;
  setupCompleted: () => void;
}
```

---

## 🔄 Utility Components

### BookingProgressComponent

**Purpose**: Visual status tracking for reservations.

**Location**: `src/app/shared/components/booking-progress/`

**Features**:

- ✅ Multi-step progress indicator
- ✅ Status-based styling
- ✅ Estimated completion times
- ✅ Action buttons for each step

**Usage**:

```html
<app-booking-progress [reservation]="currentReservation" [showActions]="true" (statusChanged)="onStatusChanged($event)" (actionClicked)="onActionClicked($event)"> </app-booking-progress>
```

**Props**:

```typescript
interface ProgressProps {
  reservation: ReservationDto;
  showActions: boolean;
}

interface ProgressStep {
  label: string;
  status: "pending" | "active" | "completed" | "cancelled";
  timestamp?: Date;
  actionLabel?: string;
}

interface ProgressEvents {
  statusChanged: (newStatus: ReservationStatus) => void;
  actionClicked: (step: ProgressStep) => void;
}
```

---

### LeaveReviewCardComponent

**Purpose**: Compact review submission card for completed services.

**Location**: `src/app/shared/components/leave-review-card/`

**Features**:

- ✅ Quick rating submission
- ✅ Optional review text
- ✅ Service details display
- ✅ One-click submission

**Usage**:

```html
<app-leave-review-card [reservation]="completedService" [hasExistingReview]="false" (reviewSubmitted)="onQuickReview($event)" (fullReviewRequested)="openReviewModal()"> </app-leave-review-card>
```

---

## 🎨 Styling Guidelines

### Consistent Design Patterns

```css
/* Card Components */
.component-card {
  @apply bg-white rounded-lg shadow-md border border-gray-200;
  @apply p-6 transition-shadow duration-200;
}

.component-card:hover {
  @apply shadow-lg;
}

/* Action Buttons */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md;
  @apply hover:bg-blue-700 transition-colors duration-200;
}

.btn-secondary {
  @apply border border-gray-300 text-gray-700 px-4 py-2 rounded-md;
  @apply hover:bg-gray-50 transition-colors duration-200;
}

/* Form Elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

/* Status Indicators */
.status-pending {
  @apply text-yellow-600 bg-yellow-50;
}
.status-confirmed {
  @apply text-blue-600 bg-blue-50;
}
.status-completed {
  @apply text-green-600 bg-green-50;
}
.status-cancelled {
  @apply text-red-600 bg-red-50;
}
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
.responsive-grid {
  @apply grid gap-4;
  @apply grid-cols-1; /* Mobile: 1 column */
  @apply sm:grid-cols-2; /* Small: 2 columns */
  @apply md:grid-cols-2; /* Medium: 2 columns */
  @apply lg:grid-cols-3; /* Large: 3 columns */
  @apply xl:grid-cols-4; /* Extra Large: 4 columns */
}
```

---

## 🔧 Component Testing

### Testing Template

```typescript
describe("ComponentName", () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentName, CommonModule],
      providers: [{ provide: ServiceName, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit events correctly", () => {
    spyOn(component.eventName, "emit");

    // Trigger action
    component.handleAction();

    expect(component.eventName.emit).toHaveBeenCalledWith(expectedData);
  });

  it("should display data correctly", () => {
    component.inputData = mockData;
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.querySelector(".test-element").textContent).toContain("Expected Text");
  });
});
```

---

## 📚 Best Practices

### Component Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Input/Output Pattern**: Use `@Input()` for data, `@Output()` for events
3. **Reusability**: Design for multiple contexts and use cases
4. **Accessibility**: Include ARIA labels and keyboard navigation
5. **Performance**: Use OnPush change detection when possible

### Code Quality Standards

```typescript
// ✅ Good Example
@Component({
  selector: "app-cleaner-card",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: "./cleaner-card.component.html",
  styles: ["./cleaner-card.component.css"],
})
export class CleanerCardComponent {
  @Input({ required: true }) cleaner!: CleanerCardModel;
  @Input() showActions = true;
  @Output() selected = new EventEmitter<CleanerCardModel>();

  onSelect() {
    this.selected.emit(this.cleaner);
  }
}
```

### Documentation Standards

Each component should include:

- Clear purpose description
- Props interface with types
- Events interface with payloads
- Usage examples
- Styling guidelines
- Testing examples

---

**Component Reference Complete! 🎯**

_Use this guide to understand and maintain the CleanMe component architecture._
