import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-success',
  imports: [],
  templateUrl: './registration-success.component.html',
  styleUrl: './registration-success.component.css'
})
export class RegistrationSuccessComponent {
  constructor(private router: Router){}

  back(){
    this.router.navigate(["registration"])
  }

  login(){
    this.router.navigate(["login"])
  }
}
