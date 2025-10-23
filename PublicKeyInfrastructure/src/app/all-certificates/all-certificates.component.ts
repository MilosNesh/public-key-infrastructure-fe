import { Component } from '@angular/core';
import { CertificateListComponent } from '../certificate-list/certificate-list.component';
import { EndEntityListComponent } from '../end-entity-list/end-entity-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-certificates',
  imports: [ CertificateListComponent, 
    // EndEntityListComponent
   ],
  templateUrl: './all-certificates.component.html',
  styleUrl: './all-certificates.component.css'
})
export class AllCertificatesComponent {
  constructor(private router: Router) {}
  ngOnInit(){
    if(localStorage.getItem("mustChangePassword") === "true") {
      this.router.navigate(["recover/ "]);
      return;
    }
  }
}
