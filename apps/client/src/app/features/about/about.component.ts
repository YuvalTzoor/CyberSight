import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MainHeadingComponent } from '~app/shared/headings/main-heading/main-heading.component';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatChipsModule, MainHeadingComponent],
})
export class AboutComponent {}
