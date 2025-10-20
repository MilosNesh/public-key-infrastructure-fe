import { Component } from '@angular/core';
import { CertificateListComponent } from '../certificate-list/certificate-list.component';
import { EndEntityListComponent } from '../end-entity-list/end-entity-list.component';

@Component({
  selector: 'app-all-certificates',
  imports: [ CertificateListComponent, EndEntityListComponent ],
  templateUrl: './all-certificates.component.html',
  styleUrl: './all-certificates.component.css'
})
export class AllCertificatesComponent {

}
