import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-animated-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-animated-button.component.html',
  styleUrls: ['./custom-animated-button.component.css'],
})
export class CustomAnimatedButtonComponent {
  @Input() backgroundColor: string = 'black';
  @Input() type: string = 'button';
  @Input() isDisabled = false;

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    this.buttonClick.emit(event);
  }
}
