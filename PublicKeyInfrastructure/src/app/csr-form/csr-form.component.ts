import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


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

  form!: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.form = this.fb.group({
      userId: [1, [Validators.required, Validators.min(1)]] // ID ulogovanog korisnika
    });
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

    if (!this.uploadedCsrFile) {
      this.error = 'Molimo izaberite CSR fajl.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Molimo popunite sva obavezna polja.';
      return;
    }

    this.issuing = true;
    const v = this.form.value;

    this.api.uploadCSR(this.uploadedCsrFile, v.userId!).subscribe({
      next: (res) => {
        this.successMessage = typeof res === 'string' ? res : 'CSR uspešno poslat!';
        this.issuing = false;
      },
      error: (err) => {
        this.error = 'Greška pri slanju: ' + (err?.error?.message || err?.error || err?.message || 'Nepoznata greška');
        this.issuing = false;
      }
    });
  }

}
