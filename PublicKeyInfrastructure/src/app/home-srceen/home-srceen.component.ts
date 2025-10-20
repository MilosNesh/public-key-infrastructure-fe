import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-srceen',
  imports: [],
  templateUrl: './home-srceen.component.html',
  styleUrl: './home-srceen.component.css'
})
export class HomeSrceenComponent {
  constructor(private router: Router) {}
  login() {
    this.router.navigate(["login"])
  }
  register() {
    this.router.navigate(["registration"])
  }
}
