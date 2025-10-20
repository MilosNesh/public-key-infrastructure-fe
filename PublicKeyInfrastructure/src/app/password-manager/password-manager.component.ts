import { Component } from '@angular/core';
import { Password } from '../models/password.model';
import { PasswordService } from '../services/password.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../services/crypto.service';

@Component({
  selector: 'app-password-manager',
  imports: [
    CommonModule,
  ],
  templateUrl: './password-manager.component.html',
  styleUrl: './password-manager.component.css'
})
export class PasswordManagerComponent {
  passwordList: Password[] = []
  privateKeyPem: string = ''; 

  constructor(private passwordSerivce: PasswordService, private router: Router, private cryptoService: CryptoService) {}

  ngOnInit() {
    var token = localStorage.getItem("pki_token") || ""
    this.passwordSerivce.getAllForUser(token).subscribe({
      next: (res) => {
        this.passwordList = res
      }
    })  
  }

  addPassword() {
    this.router.navigate(["password-form"])
  }

  async onKeyFileUpload(event: any) {
    const file = event.target.files[0];
    const pem = await file.text();
    this.privateKeyPem = pem;
    this.decryptPassword()
  }

  decryptPassword() {
    for (let p of this.passwordList) {
      this.cryptoService.decryptPassword(this.privateKeyPem, p.password)
        .then(decrypted => {
          p.password = decrypted;
        })
        .catch(err => {
          console.error(`Greška prilikom dešifrovanja za ${p.siteName}:`, err);
          p.password = 'DECRYPTION FAILED';
        });
    }
  }

  showPassword(password: string) {
    if(password.length > 50)
      return "**********"
    return password
  }
}
