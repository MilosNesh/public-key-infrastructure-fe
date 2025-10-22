import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-registration-ca-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './registration-ca-user.component.html',
  styleUrl: './registration-ca-user.component.css'
})
export class RegistrationCaUserComponent {
  registrationForm!: FormGroup;
  passwordStrength: number = 0;
  passwordFeedback: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.redirect('ROLE_ADMIN')
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      organization: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registrationForm!.valid) {
      var user: User = {
        name: this.registrationForm.value.name,
        surname: this.registrationForm.value.surname,
        email: this.registrationForm.value.email,
        password: '',
        organization: this.registrationForm.value.organization
      }
      
      this.authService.registerCaUser(user, this.authService.getToken()).subscribe({
        next: (res) => {
          this.router.navigate([""]);
        }
      })
      
    }
  }
}
