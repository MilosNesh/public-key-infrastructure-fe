import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import zxcvbn from 'zxcvbn';
import { RecoveryData } from '../../models/recovery-data.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-recover',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css'
})
export class RecoverComponent {
  recoveryForm!: FormGroup
  passwordStrength: number = 0;
  passwordFeedback: string = '';
  token: string = '';
  errorMessage: string = '';
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
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
    const password = this.recoveryForm.get('password')?.value;
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
    if (this.recoveryForm!.valid) {
      var recoveryData: RecoveryData = {
        email: this.recoveryForm.value.email,
        password: this.recoveryForm.value.password,
      }
      if(this.token === ' ')
        this.token = this.authService.getToken()
      this.authService.recover(recoveryData, this.token).subscribe({
        next: (res) => {
          this.authService.logout()
          this.router.navigate(["login"]);
        },
         error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error;
        }
      }) 
    }
  }

}
