import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'CleanMe - Find your cleaner';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Theme service is initialized on construction, no need for explicit init
  }
}
