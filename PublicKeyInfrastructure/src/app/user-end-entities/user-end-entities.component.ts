import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { CertificateResponse } from '../models/certificate-response';
import { CertificateItemComponent } from '../certificate-item/certificate-item.component';

@Component({
  selector: 'app-user-end-entities',
  imports: [CommonModule, CertificateItemComponent],
  templateUrl: './user-end-entities.component.html',
  styleUrl: './user-end-entities.component.css'
})
export class UserEndEntitiesComponent implements OnInit {
  certificates: CertificateResponse[] = [];
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getUserEndEntityCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Greška pri učitavanju korisničkih end entity sertifikata:', error);
        this.error = 'Greška pri učitavanju korisničkih end entity sertifikata. Molimo pokušajte ponovo.';
        this.loading = false;
      }
    });
  }
}
