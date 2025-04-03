import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleanerDashboardComponent } from './cleaner-dashboard.component';

describe('CleanerDashboardComponent', () => {
  let component: CleanerDashboardComponent;
  let fixture: ComponentFixture<CleanerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CleanerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CleanerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
