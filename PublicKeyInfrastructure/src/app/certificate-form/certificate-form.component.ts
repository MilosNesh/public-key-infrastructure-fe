import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { ExtendedRequest, AdditionalExtension } from '../models/extended-request';

interface KeyUsageOption {
  label: string;
  value: string;
}

interface ExtendedKeyUsageOption {
  label: string;
  value: string;
}

interface IssuerOption {
  id: number;
  name: string;
  maxTTL: number; // u danima
  allowCA: boolean;
  allowedKeyUsages: string[];
  allowedExtendedKeyUsages: string[];
}

@Component({
  selector: 'app-certificate-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './certificate-form.component.html',
  styleUrl: './certificate-form.component.css'
})
export class CertificateFormComponent implements OnInit{

    certForm!: FormGroup;

  issuers: IssuerOption[] = []; // load from backend
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' | 'info' = 'info';
  isLoading: boolean = false;
  keyUsageOptions: KeyUsageOption[] = [
    { label: 'Digital Signature', value: 'digitalSignature' },
    { label: 'Key Encipherment', value: 'keyEncipherment' },
    { label: 'Certificate Sign', value: 'keyCertSign' },
    { label: 'CRL Sign', value: 'cRLSign' }
  ];
  extendedKeyUsageOptions: ExtendedKeyUsageOption[] = [
    { label: 'Server Auth', value: 'serverAuth' },
    { label: 'Client Auth', value: 'clientAuth' },
    { label: 'Code Signing', value: 'codeSigning' },
    { label: 'Email Protection', value: 'emailProtection' }
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    // Set default dates
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    this.certForm = this.fb.group({
      issuerId: [''],
      cn: ['', Validators.required],
      organization: [''],
      organizationalUnit: [''],
      country: [''],
      email: [''],
      sanList: this.fb.array([]),
      startDate: [this.formatDateForInput(today)],
      endDate: [this.formatDateForInput(oneYearFromNow)],
      keyAlgorithm: ['RSA'],
      keySize: [2048],
      keyUsages: this.fb.array([]),
      extendedKeyUsages: this.fb.array([]),
      isCA: [false],
      pathLength: [0],
      additionalExtensions: [''],
      saveAsTemplate: [false]
    });

    // Add initial SAN field
    this.addSAN();
    this.loadIssuers();
  }

  loadIssuers() {
    this.apiService.getValidCACertificates().subscribe({
      next: (response) => {
        console.log('API Response received:', response);
        this.issuers = response.map((alias, index) => ({
          id: index,
          name: alias,
          maxTTL: 365,
          allowCA: true,
          allowedKeyUsages: ['keyCertSign', 'cRLSign'],
          allowedExtendedKeyUsages: []
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

  get sanList() {
    return this.certForm.get('sanList') as FormArray;
  }

  addSAN() {
    this.sanList.push(this.fb.control('', Validators.required));
  }

  removeSAN(index: number) {
    this.sanList.removeAt(index);
  }

  onIssuerChange() {
    const issuerId = this.certForm.value.issuerId;
    const issuer = this.issuers.find(i => i.id === issuerId);
    if (!issuer) return;

    // enforce max TTL by adjusting end date if needed
    const startDate = new Date(this.certForm.value.startDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);

    const currentEndDate = new Date(this.certForm.value.endDate);
    if (currentEndDate > maxEndDate) {
      this.certForm.patchValue({ endDate: this.formatDateForInput(maxEndDate) });
    }

    // optionally restrict key usages
    const filteredKU = this.certForm.value.keyUsages.filter((ku: string) =>
      issuer.allowedKeyUsages.includes(ku)
    );
    this.certForm.patchValue({ keyUsages: filteredKU });

    const filteredEKU = this.certForm.value.extendedKeyUsages.filter((eku: string) =>
      issuer.allowedExtendedKeyUsages.includes(eku)
    );
    this.certForm.patchValue({ extendedKeyUsages: filteredEKU });

    // if CA not allowed, uncheck isCA
    if (!issuer.allowCA && this.certForm.value.isCA) {
      this.certForm.patchValue({ isCA: false });
    }
  }

  submit() {
    console.log('Submit method called');
    console.log('Form valid:', this.certForm.valid);
    console.log('Form errors:', this.certForm.errors);

    // if (this.certForm.invalid) {
    //   console.log('Form is invalid, showing error');
    //   // Mark all fields as touched to show validation errors
    //   this.certForm.markAllAsTouched();
    //   this.showFeedback('Please fill in the Common Name field.', 'error');
    //   return;
    // }

    console.log('Starting API call...');
    this.isLoading = true;
    this.feedbackMessage = '';

    const formValue = this.certForm.value;
    console.log('Form value:', formValue);

    // Prepare the request payload according to ExtendedRequest model
    const selectedIssuer = this.issuers.find(i => i.id == formValue.issuerId);
    const request: ExtendedRequest = {
      issuerAlias: selectedIssuer ? selectedIssuer.name : undefined,
      commonName: formValue.cn,
      organization: formValue.organization || undefined,
      organizationalUnit: formValue.organizationalUnit || undefined,
      country: formValue.country || undefined,
      email: formValue.email || undefined,
      sanList: formValue.sanList.filter((san: string) => san && san.trim() !== ''),
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      isCA: formValue.isCA || false,
      pathLength: Number(formValue.pathLength || 0),
      keyUsages: formValue.keyUsages || [],
      extendedKeyUsages: formValue.extendedKeyUsages || [],
      additionalExtensions: formValue.additionalExtensions ?
        this.parseAdditionalExtensions(formValue.additionalExtensions) : undefined,
      saveAsTemplate: formValue.saveAsTemplate || false
    };

    console.log('Certificate payload:', request);
    console.log('About to call API...');

    // Call the API
    this.apiService.createRootCA(request).subscribe({
      next: (response) => {
        console.log('API Response received:', response);
        this.isLoading = false;
        this.showFeedback(response.message || 'Certificate created successfully!', 'success');
        this.feedbackMessage = "Certificate created successfully!";
        // Optionally reset the form or navigate
        // this.certForm.reset();
      },
      error: (error) => {
        console.log('API Error occurred:', error);
        this.isLoading = false;
        const errorMessage = error.error?.message || error.message || 'An error occurred while creating the certificate.';
        this.showFeedback(errorMessage, 'error');
        console.error('Error creating certificate:', error);
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

  onCheckboxChange(event: any, controlName: string) {
  const formArray: FormArray = this.certForm.get(controlName) as FormArray;

  if (event.target.checked) {
    formArray.push(new FormControl(event.target.value));
  } else {
    const index = formArray.controls.findIndex(x => x.value === event.target.value);
    formArray.removeAt(index);
  }
}

  get selectedIssuer() {
    const issuerId = this.certForm.get('issuerId')?.value;
    return this.issuers.find(i => i.id == issuerId);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onStartDateChange() {
    const startDate = new Date(this.certForm.value.startDate);
    const issuerId = this.certForm.value.issuerId;
    const issuer = this.issuers.find(i => i.id === issuerId);

    if (issuer) {
      // If issuer has max TTL constraint, adjust end date
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);

      const currentEndDate = new Date(this.certForm.value.endDate);
      if (currentEndDate < startDate || currentEndDate > maxEndDate) {
        this.certForm.patchValue({ endDate: this.formatDateForInput(maxEndDate) });
      }
    }
  }

  onEndDateChange() {
    const startDate = new Date(this.certForm.value.startDate);
    const endDate = new Date(this.certForm.value.endDate);
    const issuerId = this.certForm.value.issuerId;
    const issuer = this.issuers.find(i => i.id === issuerId);

    if (issuer) {
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);

      if (endDate > maxEndDate) {
        this.certForm.patchValue({ endDate: this.formatDateForInput(maxEndDate) });
      }
    }

    // Ensure end date is after start date
    if (endDate <= startDate) {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      this.certForm.patchValue({ endDate: this.formatDateForInput(newEndDate) });
    }
  }

  get maxEndDate(): string {
    const startDate = new Date(this.certForm.value.startDate);
    const issuer = this.selectedIssuer;

    if (issuer) {
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);
      return this.formatDateForInput(maxEndDate);
    }

    return '';
  }

  calculateDuration(): number {
    const startDate = new Date(this.certForm.value.startDate);
    const endDate = new Date(this.certForm.value.endDate);

    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return 0;
  }

  private parseAdditionalExtensions(extensionsJson: string): AdditionalExtension[] {
    try {
      if (!extensionsJson || extensionsJson.trim() === '') {
        return [];
      }

      const parsed = JSON.parse(extensionsJson);

      // If it's already an array of AdditionalExtension objects
      if (Array.isArray(parsed)) {
        return parsed.filter(ext => ext.name && ext.value);
      }

      // If it's an object, convert to array
      if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([name, value]) => ({
          name,
          value: String(value)
        }));
      }

      return [];
    } catch (error) {
      console.warn('Failed to parse additionalExtensions:', error);
      return [];
    }
  }

}
