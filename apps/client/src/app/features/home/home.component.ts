import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '~app/auth/shared/auth.service';
import { ROUTES_CONFIG, RoutesConfig } from '~app/configs/routes.config';
import { CustomAnimatedButtonComponent } from '~app/shared/buttons/custom-animated-button/custom-animated-button.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [NgClass, RouterLink, CommonModule, AsyncPipe, CustomAnimatedButtonComponent],
})
export class HomeComponent {
  constructor(@Inject(ROUTES_CONFIG) public routesConfig: RoutesConfig) {}
  isLoggedIn$ = inject(AuthService).isAuthenticated$;
}
