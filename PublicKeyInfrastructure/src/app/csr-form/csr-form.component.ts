import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CAWithValidityDTO } from '../models/ca-with-validity.model';

interface IssuerOption {
  id: number;
  name: string;
  maxTTL: number;
  allowCA: boolean;
  allowedKeyUsages: string[];
  allowedExtendedKeyUsages: string[];
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-csr-form',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './csr-form.component.html',
  styleUrl: './csr-form.component.css'
})
export class CsrFormComponent implements OnInit{

  uploadedCsrFile: File | null = null;
  uploadedCsrContent: string | null = null;

  issuing = false;
  error: string | null = null;
  successMessage: string | null = null;
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' | 'info' = 'info';

  form!: FormGroup;
  issuers: IssuerOption[] = [];

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    // Set default dates
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    this.form = this.fb.group({
      issuerId: ['', Validators.required],
      startDate: [this.formatDateForInput(today), Validators.required],
      endDate: [this.formatDateForInput(oneYearFromNow), Validators.required]
    });

    this.loadIssuers();
  }

  onFileSelected(event: any) {
    this.error = null;
    this.uploadedCsrContent = null;
    this.uploadedCsrFile = null;

    const file = event.target.files[0];
    if (!file) return;

    // Proveri ekstenziju
    if (!file.name.endsWith('.csr') && !file.name.endsWith('.pem')) {
      this.error = 'Molimo izaberite .csr ili .pem fajl.';
      return;
    }

    // Postavi fajl odmah
    this.uploadedCsrFile = file;

    // Učitaj sadržaj fajla za prikaz (opciono)
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedCsrContent = e.target.result;

      // Osnovna validacija PEM formata (samo upozorenje, ne blokiraj)
      if (!this.uploadedCsrContent?.includes('BEGIN CERTIFICATE REQUEST')) {
        console.warn('Upozorenje: Fajl možda nije validan CSR u PEM formatu.');
        // Ne postavljaj error, samo upozori
      }
    };
    reader.onerror = () => {
      this.error = 'Greška pri učitavanju fajla.';
      this.uploadedCsrFile = null;
    };
    reader.readAsText(file);
  }

  onSubmit() {
    this.error = null;
    this.successMessage = null;
    this.feedbackMessage = '';

    if (!this.uploadedCsrFile) {
      this.error = 'Molimo izaberite CSR fajl.';
      this.showFeedback('Molimo izaberite CSR fajl.', 'error');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Molimo popunite sva obavezna polja.';
      this.showFeedback('Molimo popunite sva obavezna polja.', 'error');
      return;
    }

    this.issuing = true;
    const v = this.form.value;

    // Get selected issuer alias
    const selectedIssuer = this.issuers.find(i => i.id == v.issuerId);
    if (!selectedIssuer) {
      this.error = 'Molimo izaberite CA issuer-a.';
      this.showFeedback('Molimo izaberite CA issuer-a.', 'error');
      this.issuing = false;
      return;
    }

    // Convert dates to ISO format for backend (2024-10-21T00:00:00.000Z)
    const startDateISO = this.formatDateForBackend(v.startDate);
    const endDateISO = this.formatDateForBackend(v.endDate);

    this.api.uploadCSRWithCertificate(
      this.uploadedCsrFile, 
      selectedIssuer.name,
      startDateISO,
      endDateISO
    ).subscribe({
      next: (res) => {
        const message = res.message || 'CSR uspešno poslat!';
        this.successMessage = message;
        this.showFeedback(message, 'success');
        this.issuing = false;
        // Optionally reset form
        this.uploadedCsrFile = null;
        this.uploadedCsrContent = null;
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.error = 'Greška pri slanju: ' + (err?.error?.message || err?.error || err?.message || 'Nepoznata greška');
        this.showFeedback(this.error, 'error');
        this.issuing = false;
      }
    });
  }

  loadIssuers() {
    this.api.getValidCACertificates().subscribe({
      next: (response) => {
        console.log('API Response received:', response);
        this.issuers = response.map((ca: CAWithValidityDTO, index) => ({
          id: index,
          name: ca.alias,
          maxTTL: 365,
          allowCA: true,
          allowedKeyUsages: ['keyCertSign', 'cRLSign'],
          allowedExtendedKeyUsages: [],
          startDate: new Date(ca.startDate),
          endDate: new Date(ca.endDate)
        }));
      },
      error: (error) => {
        console.log('API Error occurred:', error);
        const errorMessage = error.error?.message || error.message || 'An error occurred while loading issuers.';
        this.showFeedback(errorMessage, 'error');
        console.error('Error loading issuers:', error);
      }
    });
  }

  onIssuerChange() {
    const issuerId = this.form.value.issuerId;
    const issuer = this.issuers.find(i => i.id == issuerId);
    if (!issuer) return;

    // Automatically set start date to the later of today or CA's start date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const caStartDate = new Date(issuer.startDate);
    caStartDate.setHours(0, 0, 0, 0);

    const newStartDate = today > caStartDate ? today : caStartDate;

    // Calculate the maximum possible end date
    const calculatedMaxEndDate = new Date(newStartDate);
    calculatedMaxEndDate.setDate(calculatedMaxEndDate.getDate() + issuer.maxTTL);

    // The actual max end date is the minimum of calculated maxEndDate and CA's endDate
    const effectiveMaxEndDate = calculatedMaxEndDate > issuer.endDate ? issuer.endDate : calculatedMaxEndDate;

    // Set both start and end dates
    this.form.patchValue({
      startDate: this.formatDateForInput(newStartDate),
      endDate: this.formatDateForInput(effectiveMaxEndDate)
    });
  }

  onStartDateChange() {
    const startDate = new Date(this.form.value.startDate);
    const issuerId = this.form.value.issuerId;
    const issuer = this.issuers.find(i => i.id == issuerId);

    if (issuer) {
      // Ensure start date is not before CA's start date
      if (startDate < issuer.startDate) {
        this.form.patchValue({ startDate: this.formatDateForInput(issuer.startDate) });
        return;
      }

      // If issuer has max TTL constraint, adjust end date
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);

      // The actual max end date is the minimum of calculated maxEndDate and CA's endDate
      const effectiveMaxEndDate = maxEndDate > issuer.endDate ? issuer.endDate : maxEndDate;

      const currentEndDate = new Date(this.form.value.endDate);
      if (currentEndDate < startDate || currentEndDate > effectiveMaxEndDate) {
        this.form.patchValue({ endDate: this.formatDateForInput(effectiveMaxEndDate) });
      }
    }
  }

  onEndDateChange() {
    const startDate = new Date(this.form.value.startDate);
    const endDate = new Date(this.form.value.endDate);
    const issuerId = this.form.value.issuerId;
    const issuer = this.issuers.find(i => i.id == issuerId);

    if (issuer) {
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);

      // The actual max end date is the minimum of calculated maxEndDate and CA's endDate
      const effectiveMaxEndDate = maxEndDate > issuer.endDate ? issuer.endDate : maxEndDate;

      if (endDate > effectiveMaxEndDate) {
        this.form.patchValue({ endDate: this.formatDateForInput(effectiveMaxEndDate) });
        return;
      }

      // Ensure end date is not after CA's end date
      if (endDate > issuer.endDate) {
        this.form.patchValue({ endDate: this.formatDateForInput(issuer.endDate) });
        return;
      }
    }

    // Ensure end date is after start date
    if (endDate <= startDate) {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      this.form.patchValue({ endDate: this.formatDateForInput(newEndDate) });
    }
  }

  get selectedIssuer() {
    const issuerId = this.form.get('issuerId')?.value;
    return this.issuers.find(i => i.id == issuerId);
  }

  get maxEndDate(): string {
    const startDate = new Date(this.form.value.startDate);
    const issuer = this.selectedIssuer;

    if (issuer) {
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);

      // The actual max end date is the minimum of calculated maxEndDate and CA's endDate
      const effectiveMaxEndDate = maxEndDate > issuer.endDate ? issuer.endDate : maxEndDate;
      return this.formatDateForInput(effectiveMaxEndDate);
    }

    return '';
  }

  get minStartDate(): string {
    const issuer = this.selectedIssuer;
    if (issuer) {
      return this.formatDateForInput(issuer.startDate);
    }
    return '';
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateForBackend(dateString: string): string {
    // Convert YYYY-MM-DD to ISO format: 2024-10-21T00:00:00.000Z
    const date = new Date(dateString);
    // Set to midnight UTC
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
  }

  private showFeedback(message: string, type: 'success' | 'error' | 'info') {
    this.feedbackMessage = message;
    this.feedbackType = type;

    // Auto-hide success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (this.feedbackMessage === message) {
          this.feedbackMessage = '';
        }
      }, 5000);
    }
  }

}
