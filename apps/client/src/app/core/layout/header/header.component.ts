import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '~app/auth/shared/auth.service';
import { ROUTES_CONFIG, RoutesConfig } from '~app/configs/routes.config';
import { UserService } from '~app/users/shared/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule, AsyncPipe],
})
export class HeaderComponent {
  showHamburger = false;
  isHambungerOpen = false;

  constructor(
    @Inject(ROUTES_CONFIG) public routesConfig: RoutesConfig,
    private authService: AuthService,
  ) {}

  currentUser$ = inject(UserService).currentUser$;
  isLoggedIn$ = inject(AuthService).isAuthenticated$;

  logOut(): void {
    this.authService.logout();
  }
  toggleMenu(): void {
    this.showHamburger = !this.showHamburger;
    this.isHambungerOpen = !this.isHambungerOpen;
  }
  closeMenu() {
    this.showHamburger = false;
    this.isHambungerOpen = false;
  }
}
