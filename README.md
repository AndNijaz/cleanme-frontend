# CleanMe Frontend

A modern Angular application for connecting cleaning service providers with clients. This frontend provides a comprehensive platform for cleaners to manage their services, availability, and bookings.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.4.

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

## 🎯 Key Features

### 🧹 Cleaner Services Management

- **Service Selection**: Choose from 4 predefined professional cleaning services
- **Custom Descriptions**: Personalize service offerings with custom descriptions
- **Pricing Configuration**: Set hourly rates with validation (5-200 BAM)
- **Real-time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Mobile-first responsive interface

### 🔐 Authentication System

- **User Registration**: Complete registration flow for cleaners
- **JWT Authentication**: Secure token-based authentication
- **Profile Management**: Comprehensive cleaner profile setup

### 🎨 Modern UI/UX

- **Tailwind CSS**: Modern, responsive design system
- **Gradient Design**: Beautiful blue-indigo gradient theme
- **Interactive Elements**: Hover effects and smooth animations
- **Toast Notifications**: Professional slide-in notifications

## 📚 Documentation

For detailed documentation about the services feature, see:

- **[SERVICES-DOCS.md](./SERVICES-DOCS.md)** - Comprehensive services feature documentation

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

## 🛠️ Development

### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

### Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## 🔧 Configuration

### Environment Setup

Configure your environment variables in:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

### API Base URL

Set the backend API URL in environment files:

```typescript
export const environment = {
  production: false,
  NG_APP_BASE_URL: "http://localhost:8080",
};
```

## 🚀 Deployment

### Production Build

```bash
ng build --configuration production
```

### Environment Variables

Make sure to configure the production API URL before deployment.

## 📋 Features Overview

### Implemented ✅

- [x] User authentication system
- [x] Cleaner service management
- [x] Service selection interface
- [x] Custom service descriptions
- [x] Hourly rate configuration
- [x] Toast notification system
- [x] Responsive design
- [x] Error handling

### Planned 🔄

- [ ] Availability scheduling
- [ ] Booking management
- [ ] Profile photo upload
- [ ] Multi-language support
- [ ] Dark mode theme

## 🤝 Contributing

1. Follow Angular style guide
2. Write unit tests for new features
3. Update documentation for changes
4. Use conventional commit messages
5. Create pull requests for review

## 📞 Support

For help and support:

- Check the documentation in `SERVICES-DOCS.md`
- Review inline code comments
- Check browser console for error messages

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

**CleanMe Frontend** - Modern Angular application for cleaning service management
