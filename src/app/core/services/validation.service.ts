import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.trim());
  }

  /**
   * Validate email with detailed result
   */
  validateEmail(email: string): ValidationResult {
    if (!email || !email.trim()) {
      return { isValid: false, message: 'Email is required.' };
    }

    if (!this.isValidEmail(email)) {
      return { isValid: false, message: 'Please enter a valid email address.' };
    }

    return { isValid: true };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string, minLength: number = 6): ValidationResult {
    if (!password) {
      return { isValid: false, message: 'Password is required.' };
    }

    if (password.length < minLength) {
      return {
        isValid: false,
        message: `Password must be at least ${minLength} characters long.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate password confirmation
   */
  validatePasswordConfirmation(
    password: string,
    confirmPassword: string
  ): ValidationResult {
    if (!confirmPassword) {
      return { isValid: false, message: 'Password confirmation is required.' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, message: 'Passwords do not match.' };
    }

    return { isValid: true };
  }

  /**
   * Validate required field
   */
  validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value || !value.trim()) {
      return { isValid: false, message: `${fieldName} is required.` };
    }

    return { isValid: true };
  }

  /**
   * Validate phone number (basic format)
   */
  validatePhoneNumber(phone: string): ValidationResult {
    if (!phone || !phone.trim()) {
      return { isValid: false, message: 'Phone number is required.' };
    }

    // Basic phone validation - can be extended for specific formats
    const phonePattern = /^[\+]?[0-9\s\-\(\)]{7,}$/;
    if (!phonePattern.test(phone.trim())) {
      return { isValid: false, message: 'Please enter a valid phone number.' };
    }

    return { isValid: true };
  }

  /**
   * Validate multiple required fields at once
   */
  validateRequiredFields(fields: Record<string, string>): FormValidationResult {
    const errors: string[] = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      const result = this.validateRequired(value, fieldName);
      if (!result.isValid && result.message) {
        errors.push(result.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate login form
   */
  validateLoginForm(email: string, password: string): FormValidationResult {
    const errors: string[] = [];

    // Check required fields
    const requiredFields = { Email: email, Password: password };
    const requiredResult = this.validateRequiredFields(requiredFields);
    errors.push(...requiredResult.errors);

    // If required fields are valid, check format
    if (requiredResult.isValid) {
      const emailResult = this.validateEmail(email);
      if (!emailResult.isValid && emailResult.message) {
        errors.push(emailResult.message);
      }

      const passwordResult = this.validatePassword(password);
      if (!passwordResult.isValid && passwordResult.message) {
        errors.push(passwordResult.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate registration form
   */
  validateRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }): FormValidationResult {
    const errors: string[] = [];

    // Check required fields
    const requiredFields = {
      'First Name': data.firstName,
      'Last Name': data.lastName,
      Email: data.email,
      Address: data.address,
      'Phone Number': data.phoneNumber,
      Password: data.password,
      'Confirm Password': data.confirmPassword,
    };

    const requiredResult = this.validateRequiredFields(requiredFields);
    errors.push(...requiredResult.errors);

    // If required fields are valid, check formats
    if (requiredResult.isValid) {
      const emailResult = this.validateEmail(data.email);
      if (!emailResult.isValid && emailResult.message) {
        errors.push(emailResult.message);
      }

      const phoneResult = this.validatePhoneNumber(data.phoneNumber);
      if (!phoneResult.isValid && phoneResult.message) {
        errors.push(phoneResult.message);
      }

      const passwordResult = this.validatePassword(data.password);
      if (!passwordResult.isValid && passwordResult.message) {
        errors.push(passwordResult.message);
      }

      const confirmPasswordResult = this.validatePasswordConfirmation(
        data.password,
        data.confirmPassword
      );
      if (!confirmPasswordResult.isValid && confirmPasswordResult.message) {
        errors.push(confirmPasswordResult.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get first validation error message
   */
  getFirstError(validationResult: FormValidationResult): string {
    return validationResult.errors.length > 0 ? validationResult.errors[0] : '';
  }

  /**
   * Check if string contains only letters and spaces
   */
  isAlphaWithSpaces(value: string): boolean {
    const alphaPattern = /^[a-zA-ZčćžšđČĆŽŠĐ\s]+$/;
    return alphaPattern.test(value);
  }

  /**
   * Validate name field (letters and spaces only)
   */
  validateName(name: string, fieldName: string): ValidationResult {
    const requiredResult = this.validateRequired(name, fieldName);
    if (!requiredResult.isValid) {
      return requiredResult;
    }

    if (!this.isAlphaWithSpaces(name)) {
      return {
        isValid: false,
        message: `${fieldName} should contain only letters and spaces.`,
      };
    }

    return { isValid: true };
  }
}
