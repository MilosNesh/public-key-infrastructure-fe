import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PasswordService } from '../services/password.service';
import { Password } from '../models/password.model';
import { Router } from '@angular/router';
import { CryptoService } from '../services/crypto.service';

@Component({
  selector: 'app-password-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.css'
})
export class PasswordFormComponent {
  passwordForm!: FormGroup
  token: string = ""
  publicKey: string = ''
  constructor(private fb: FormBuilder, private passwordService: PasswordService, private router: Router, private cryptoService: CryptoService) {}

  ngOnInit() {
    this.token = localStorage.getItem("pki_token") || ""
    this.passwordForm = this.fb.group({
      siteName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })

    this.passwordService.getPublickey(this.token).subscribe({
      next: (res) => {
        this.publicKey = res;
      }
    })
  }

  onSubmit(): void {
    if(this.passwordForm.invalid)
      return;

    var password: Password = {
      siteName: this.passwordForm.value.siteName,
      username: this.passwordForm.value.username,
      password: this.passwordForm.value.password
    }

    this.cryptoService.encryptPassword(this.publicKey, this.passwordForm.value.password)
      .then(encrypted => {
          password.password = encrypted;
          this.passwordService.savePassword(password, this.token).subscribe({
            next: (res) => {
              this.router.navigate(["password-manager"])
            }
          })
    });    

  }

  async generateKeys() {
    const { publicPem, privatePem } = await this.cryptoService.generateKeyPair();

    // 1. Download private key (user chooses path)
    const blob = new Blob([privatePem], { type: 'application/x-pem-file' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'private_key.pem';
    a.click();

    // 2. Send public key to backend
    this.passwordService.savePublicKey(this.token, publicPem).subscribe({
      next: (res) => {
        this.publicKey = res
      }
    })
  }
}
