import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { KeyUsage, KEY_USAGE_LABELS } from '../models/key-usage.enum';
import { ExtendedKeyUsage, EXTENDED_KEY_USAGE_LABELS } from '../models/extended-key-usage.enum';
import { CertificateTemplateRequestDTO } from '../models/certificate-template.model';

@Component({
  selector: 'app-template-form',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './template-form.component.html',
  styleUrl: './template-form.component.css'
})
export class TemplateFormComponent implements OnInit {
  form!: FormGroup;
  issuers: string[] = [];
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' | 'info' = 'info';

  // Enum arrays for checkboxes
  keyUsageOptions = Object.values(KeyUsage);
  extendedKeyUsageOptions = Object.values(ExtendedKeyUsage);

  // Labels for display
  keyUsageLabels = KEY_USAGE_LABELS;
  extendedKeyUsageLabels = EXTENDED_KEY_USAGE_LABELS;

  constructor(
    private fb: FormBuilder,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadIssuers();
  }

  initForm() {
    // Create form group
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      issuerAlias: ['', Validators.required],
      commonNameRegex: ['', Validators.maxLength(512)],
      sanRegex: ['', Validators.maxLength(512)],
      ttlDays: [365, [Validators.required, Validators.min(1)]],
      enabled: [true],
      // Key Usage checkboxes
      keyUsage: this.fb.group({
        DIGITAL_SIGNATURE: [false],
        NON_REPUDIATION: [false],
        KEY_ENCIPHERMENT: [false],
        DATA_ENCIPHERMENT: [false],
        KEY_AGREEMENT: [false],
        KEY_CERT_SIGN: [false],
        CRL_SIGN: [false],
        ENCIPHER_ONLY: [false],
        DECIPHER_ONLY: [false]
      }),
      // Extended Key Usage checkboxes
      extendedKeyUsage: this.fb.group({
        SERVER_AUTH: [false],
        CLIENT_AUTH: [false],
        CODE_SIGNING: [false],
        EMAIL_PROTECTION: [false],
        TIME_STAMPING: [false],
        OCSP_SIGNING: [false],
        SMARTCARD_LOGON: [false]
      })
    });
  }

  loadIssuers() {
    this.api.getValidCACertificates().subscribe({
      next: (response) => {
        this.issuers = response.map(ca => ca.alias);
      },
      error: (error) => {
        console.error('Error loading issuers:', error);
        this.showFeedback('Greška pri učitavanju CA sertifikata', 'error');
      }
    });
  }

  onSubmit() {
    this.error = null;
    this.successMessage = null;
    this.feedbackMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Molimo popunite sva obavezna polja.';
      this.showFeedback('Molimo popunite sva obavezna polja.', 'error');
      return;
    }

    this.submitting = true;

    const formValue = this.form.value;

    // Extract selected key usages
    const selectedKeyUsages: KeyUsage[] = [];
    Object.entries(formValue.keyUsage).forEach(([key, value]) => {
      if (value) {
        selectedKeyUsages.push(key as KeyUsage);
      }
    });

    // Extract selected extended key usages
    const selectedExtendedKeyUsages: ExtendedKeyUsage[] = [];
    Object.entries(formValue.extendedKeyUsage).forEach(([key, value]) => {
      if (value) {
        selectedExtendedKeyUsages.push(key as ExtendedKeyUsage);
      }
    });

    const request: CertificateTemplateRequestDTO = {
      name: formValue.name,
      issuerAlias: formValue.issuerAlias,
      commonNameRegex: formValue.commonNameRegex || undefined,
      sanRegex: formValue.sanRegex || undefined,
      ttlDays: formValue.ttlDays,
      keyUsage: selectedKeyUsages,
      extendedKeyUsage: selectedExtendedKeyUsages,
      enabled: formValue.enabled
    };

    this.api.createCertificateTemplate(request).subscribe({
      next: (response) => {
        this.successMessage = `Šablon "${response.name}" uspešno kreiran!`;
        this.showFeedback(this.successMessage, 'success');
        this.submitting = false;
        this.form.reset({
          ttlDays: 365,
          enabled: true
        });
      },
      error: (error) => {
        console.error('Error creating template:', error);
        this.error = 'Greška pri kreiranju šablona: ' + (error?.error?.message || error?.message || 'Nepoznata greška');
        this.showFeedback(this.error, 'error');
        this.submitting = false;
      }
    });
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
