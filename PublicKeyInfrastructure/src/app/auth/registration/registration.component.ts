import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import zxcvbn from 'zxcvbn';
import { User } from '../../models/user.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  registrationForm!: FormGroup;
  passwordStrength: number = 0;
  passwordFeedback: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      organization: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (password !== confirm) {
      form.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }


  
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const result = zxcvbn(password);
    return result.score < 4 ? { weakPassword: true } : null;
  }

  onPasswordInput(): void {
    const password = this.registrationForm.get('password')?.value;
    if (password) {
      const result = zxcvbn(password);
      this.passwordStrength = result.score;
      this.passwordFeedback = result.feedback.suggestions.join(' ');
    } else {
      this.passwordStrength = 0;
      this.passwordFeedback = '';
    }
  }

  onSubmit(): void {
    if (this.registrationForm!.valid) {
      var user: User = {
        name: this.registrationForm.value.name,
        surname: this.registrationForm.value.surname,
        email: this.registrationForm.value.email,
        password: this.registrationForm.value.password,
        organization: this.registrationForm.value.organization
      }
      
      this.authService.register(user).subscribe({
        next: (res) => {
          this.router.navigate(["registration-success"]);
        }
      })
      
    } else {
      console.log('Forma nije validna');
    }
  }
}
