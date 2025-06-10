import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<Theme>('light');
  public theme$ = this.currentTheme.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;

    // For debugging: temporarily force light theme if no saved preference
    let theme: Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      theme = savedTheme;
    } else {
      // Force light theme for debugging
      theme = 'light';
    }

    console.log('Theme service initialized:', {
      savedTheme,
      selectedTheme: theme,
    });
    this.setTheme(theme);
  }

  setTheme(theme: Theme): void {
    console.log('Setting theme to:', theme);
    this.currentTheme.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Tailwind v4 uses data-theme attribute instead of classes
    root.setAttribute('data-theme', theme);

    console.log(`Applied ${theme} theme using data-theme attribute`);
    console.log('Current data-theme:', root.getAttribute('data-theme'));
  }

  toggleTheme(): void {
    const currentTheme = this.currentTheme.value;
    this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  getCurrentTheme(): Theme {
    return this.currentTheme.value;
  }

  isDarkMode(): boolean {
    return this.currentTheme.value === 'dark';
  }
}
