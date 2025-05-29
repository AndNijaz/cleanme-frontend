import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    document.body.appendChild(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.el.nativeElement.remove();
  }

  onBackdropClick(event: MouseEvent, backdrop: HTMLElement) {
    this.close.emit();
  }
}
