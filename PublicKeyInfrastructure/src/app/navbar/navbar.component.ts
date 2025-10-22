import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  role: string = ''
  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(){
    this.authService.role$.subscribe((r) => {
          this.role = r;
          console.log("ROLEEEE: ", this.role);
        });
    this.authService.isTokenExpired()
    }

  logout() {
    this.authService.logout();
  }
}
