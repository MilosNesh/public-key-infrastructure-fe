import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { CertificateResponse } from '../models/certificate-response';
import { CertificateItemComponent } from '../certificate-item/certificate-item.component';


@Component({
  selector: 'app-end-entity-list',
  imports: [ CommonModule, CertificateItemComponent ],
  templateUrl: './end-entity-list.component.html',
  styleUrl: './end-entity-list.component.css'
})
export class EndEntityListComponent {
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

    this.apiService.getAllEndEntityCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Greška pri učitavanju sertifikata:', error);
        this.error = 'Greška pri učitavanju sertifikata. Molimo pokušajte ponovo.';
        this.loading = false;
      }
    });
  }

}
