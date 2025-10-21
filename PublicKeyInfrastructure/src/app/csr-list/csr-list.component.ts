import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { CsrResponseDTO } from '../models/csr-response.model';

@Component({
  selector: 'app-csr-list',
  imports: [CommonModule],
  templateUrl: './csr-list.component.html',
  styleUrl: './csr-list.component.css'
})
export class CsrListComponent implements OnInit {
  csrList: CsrResponseDTO[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedCsr: CsrResponseDTO | null = null;
  showPemModal: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCsrs();
  }

  loadCsrs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getCsrsByUserId().subscribe({
      next: (response) => {
        console.log('CSR list received:', response);
        this.csrList = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading CSRs:', error);
        this.errorMessage = error.error?.message || error.message || 'Failed to load CSR list.';
        this.isLoading = false;
      }
    });
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('sr-RS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'Na čekanju',
      'APPROVED': 'Odobren',
      'REJECTED': 'Odbijen',
      'ISSUED': 'Izdat'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  viewCsr(csr: CsrResponseDTO): void {
    this.selectedCsr = csr;
    this.showPemModal = true;
  }

  closeModal(): void {
    this.showPemModal = false;
    this.selectedCsr = null;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('CSR PEM kopiran u clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Greška pri kopiranju u clipboard.');
    });
  }

  downloadCsr(csr: CsrResponseDTO): void {
    const blob = new Blob([csr.csrPem], { type: 'application/x-pem-file' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `csr_${csr.id}.pem`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
