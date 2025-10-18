import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { LoginDetails } from '../../models/login-details.model';
import { HttpErrorResponse } from '@angular/common/http';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup
  errorMessage =  ""
  captchaToken: string | null = null;
  siteKey=""
  recoveryMessage = ""

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.siteKey = environment.siteKey;
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onCaptchaResolved(token: string | null) {
    if (token) {
      this.captchaToken = token;
    }
  }


  onSubmit(): void {
    if(!this.loginForm.valid || !this.captchaToken)
      return;
  
    var loginDetails: LoginDetails = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      captcha: this.captchaToken
    }
    this.recoveryMessage = ""
    this.authService.login(loginDetails).subscribe({
      next: (res) => {
        console.log("login")
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error;
      }
    })
    
  }

  sendLink() {
    if(this.loginForm.value.email === ''){
      this.recoveryMessage = "Enter email if you want to recover your account."
      return
    }
    this.authService.sendLink(this.loginForm.value.email).subscribe({
      next: (res) => {
        this.recoveryMessage = "Check your email we sent you a recovery link."
      }
    })
  }
}
