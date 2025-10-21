import { Component } from '@angular/core';
import { Password } from '../models/password.model';
import { PasswordService } from '../services/password.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../services/crypto.service';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-password-manager',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './password-manager.component.html',
  styleUrl: './password-manager.component.css'
})
export class PasswordManagerComponent {
  passwordList: Password[] = []
  privateKeyPem: string = ''; 
  token: string = ''
  emails: string[] = []
  sharedPasswordList: Password[] = []
  selectedEmail: string = ''
  showEmails: boolean = false
  selectedPassword: Password | null = null
  constructor(private passwordSerivce: PasswordService, private router: Router, private cryptoService: CryptoService, private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.redirect('ROLE_USER');
    this.token = this.authService.getToken()
    this.passwordSerivce.getAllForUser(this.token).subscribe({
      next: (res) => {
        this.passwordList = res
        this.passwordSerivce.getAllSharedForUser(this.token).subscribe({
          next: (sp) => {
            this.sharedPasswordList = sp
            this.userService.getEmail(this.token).subscribe({
              next: (em) => {
                this.emails = em
              }
            })
          }
        })
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
          
        });
    }

    for (let p of this.sharedPasswordList) {
      this.cryptoService.decryptPassword(this.privateKeyPem, p.password)
        .then(decrypted => {
          p.password = decrypted;
        })
        .catch(err => {
          
        });
    }
  }

  showPassword(password: string) {
    if(password.length > 50)
      return "**********"
    return password
  }

  share() {
    if(this.selectedEmail === '' || this.selectedPassword === null)
      return
    this.passwordSerivce.getPublickeyByEmail(this.token, this.selectedEmail).subscribe({
      next: (res) => {
        var publicKey = res;
        if(res === "") {
          alert("User doesn't have a public key")
          return
        }
        this.cryptoService.encryptPassword(publicKey, this.selectedPassword!.password).then(crypted => {
          this.selectedPassword!.password = crypted
          this.selectedPassword!.username = this.selectedEmail
          this.passwordSerivce.saveSharedPassword(this.selectedPassword!, this.token).subscribe({
            next: (_res) => {
              alert("Succesfully")
              this.selectedEmail = ''
              this.selectedPassword = null
            }
          })
        })
      },
      error: (_) => {
        alert("User doesn't have a public key")
      }
    })
  }

  showList(password: Password){
    this.selectedPassword = password
    this.showEmails = true
  }
}
