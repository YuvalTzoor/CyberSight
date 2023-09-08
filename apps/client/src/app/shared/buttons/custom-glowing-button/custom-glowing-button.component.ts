import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-glowing-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-glowing-button.component.html',
  styleUrls: ['./custom-glowing-button.component.css'],
})
export class CustomGlowingButtonComponent {
  @Input() type: string = 'button';
  @Input() isDisabled = false;

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    this.buttonClick.emit(event);
  }
}
