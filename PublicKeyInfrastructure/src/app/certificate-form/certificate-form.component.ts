import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth/auth.service';
import { ExtendedRequest, AdditionalExtension } from '../models/extended-request';
import { CAWithValidityDTO } from '../models/ca-with-validity.model';
import { TemplateDropdownDTO } from '../models/template-dropdown.model';
import { CertificateTemplateResponseDTO } from '../models/certificate-template.model';

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
  startDate: Date; // CA's validity start date
  endDate: Date;   // CA's validity end date
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
  templates: TemplateDropdownDTO[] = []; // load from backend
  selectedTemplate: CertificateTemplateResponseDTO | null = null;
  cnValidationMessage: string = '';
  sanValidationMessage: string = '';
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' | 'info' = 'info';
  isLoading: boolean = false;
  role: string = '';
  isFormDisabled: boolean = false;
  organizationDisabled: boolean = false;
  keyUsageOptions: KeyUsageOption[] = [
    { label: 'Digital Signature', value: 'digitalSignature' },
    { label: 'Non Repudiation', value: 'nonRepudiation' },
    { label: 'Key Encipherment', value: 'keyEncipherment' },
    { label: 'Data Encipherment', value: 'dataEncipherment' },
    { label: 'Key Agreement', value: 'keyAgreement' },
    { label: 'Certificate Sign', value: 'keyCertSign' },
    { label: 'CRL Sign', value: 'cRLSign' },
    { label: 'Encipher Only', value: 'encipherOnly' },
    { label: 'Decipher Only', value: 'decipherOnly' }
  ];
  extendedKeyUsageOptions: ExtendedKeyUsageOption[] = [
    { label: 'Server Auth', value: 'serverAuth' },
    { label: 'Client Auth', value: 'clientAuth' },
    { label: 'Code Signing', value: 'codeSigning' },
    { label: 'Email Protection', value: 'emailProtection' },
    { label: 'Time Stamping', value: 'timeStamping' },
    { label: 'OCSP Signing', value: 'ocspSigning' },
    { label: 'Smartcard Logon', value: 'smartcardLogon' }
  ];

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    
    // Set default dates
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    this.certForm = this.fb.group({
      templateId: [''], // Template dropdown
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
    console.log('About to call loadIssuers');
    this.loadIssuers();
    this.loadTemplates();
    
    // Subscribe to role changes
    this.authService.role$.subscribe((role) => {
      console.log('Role subscription triggered, new role:', role);
      this.role = role;
      console.log('Role set to:', this.role);
      this.checkFormDisability();
      this.loadOrganizationIfCAUSER();
    });
  }

  loadIssuers() {
    this.apiService.getValidCACertificates().subscribe({
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
        console.log('Mapped issuers:', this.issuers);
        console.log('Current role when calling checkFormDisability from loadIssuers:', this.role);
        this.checkFormDisability();
      },
      error: (error) => {
        console.log('API Error occurred:', error);
        const errorMessage = error.error?.message || error.message || 'An error occurred while loading issuers.';
        this.showFeedback(errorMessage, 'error');
        console.error('Error loading issuers:', error);
      }
    });
  }

  checkFormDisability() {
    console.log('checkFormDisability called - role:', this.role, 'issuers.length:', this.issuers.length);
    
    // Disable only issuer dropdown if user is ROLE_CAUSER and has no issuers
    // Admin users should always be able to create certificates
    if (this.role === 'ROLE_CAUSER' && this.issuers.length === 0) {
      console.log('Disabling issuer dropdown for ROLE_CAUSER with no issuers');
      this.isFormDisabled = true;
      this.showFeedback('Nema dostupnih CA sertifikata za kreiranje. Kontaktirajte administratora.', 'error');
    } else {
      console.log('Form enabled - role:', this.role, 'issuers available:', this.issuers.length);
      this.isFormDisabled = false;
    }
    
    console.log('Final isFormDisabled:', this.isFormDisabled);
  }

  // Getter for submit button disabled state - admin can always submit
  get isSubmitDisabled(): boolean {
    if (this.role === 'ROLE_ADMIN') {
      return this.isLoading; // Admin can always submit, only disable when loading
    }
    return this.isLoading || this.isFormDisabled; // Other users follow normal logic
  }

  loadOrganizationIfCAUSER() {
    console.log('loadOrganizationIfCAUSER called, role:', this.role);
    
    if (this.role === 'ROLE_CAUSER') {
      console.log('User is ROLE_CAUSER, loading organization...');
      this.organizationDisabled = true;
      
      this.apiService.getOrganization().subscribe({
        next: (response) => {
          console.log('Organization loaded successfully:', response);
          console.log('Organization value:', response.organization);
          console.log('Setting organizationDisabled to:', this.organizationDisabled);
          this.certForm.patchValue({ organization: response.organization });
          console.log('Form organization value after patch:', this.certForm.get('organization')?.value);
        },
        error: (error) => {
          console.error('Error loading organization:', error);
          this.showFeedback('Greška pri učitavanju organizacije', 'error');
        }
      });
    } else {
      console.log('User is not ROLE_CAUSER, role is:', this.role);
      this.organizationDisabled = false;
    }
    
    console.log('Final organizationDisabled value:', this.organizationDisabled);
  }

  loadTemplates() {
    this.apiService.getTemplatesForDropdown().subscribe({
      next: (response) => {
        console.log('Templates loaded:', response);
        this.templates = response;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.showFeedback('Greška pri učitavanju šablona', 'error');
      }
    });
  }

  onTemplateChange() {
    const templateId = this.certForm.value.templateId;
    if (!templateId) {
      this.selectedTemplate = null;
      return;
    }

    this.apiService.getTemplateById(templateId).subscribe({
      next: (template) => {
        console.log('Template loaded:', template);
        this.selectedTemplate = template;
        this.applyTemplateToForm(template);
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.showFeedback('Greška pri učitavanju šablona', 'error');
      }
    });
  }

  applyTemplateToForm(template: CertificateTemplateResponseDTO) {
    // Set issuer alias
    const issuer = this.issuers.find(i => i.name === template.issuerAlias);
    if (issuer) {
      this.certForm.patchValue({ issuerId: issuer.id });
    }

    // Set TTL days
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + template.ttlDays);
    
    this.certForm.patchValue({
      startDate: this.formatDateForInput(today),
      endDate: this.formatDateForInput(endDate)
    });

    // Clear and set key usages
    const keyUsagesArray = this.certForm.get('keyUsages') as FormArray;
    keyUsagesArray.clear();
    
    // Map template key usages to form values
    const keyUsageMapping: { [key: string]: string } = {
      'DIGITAL_SIGNATURE': 'digitalSignature',
      'NON_REPUDIATION': 'nonRepudiation',
      'KEY_ENCIPHERMENT': 'keyEncipherment',
      'DATA_ENCIPHERMENT': 'dataEncipherment',
      'KEY_AGREEMENT': 'keyAgreement',
      'KEY_CERT_SIGN': 'keyCertSign',
      'CRL_SIGN': 'cRLSign',
      'ENCIPHER_ONLY': 'encipherOnly',
      'DECIPHER_ONLY': 'decipherOnly'
    };

    template.keyUsage.forEach(ku => {
      const formValue = keyUsageMapping[ku];
      if (formValue) {
        keyUsagesArray.push(new FormControl(formValue));
      }
    });

    // Clear and set extended key usages
    const extendedKeyUsagesArray = this.certForm.get('extendedKeyUsages') as FormArray;
    extendedKeyUsagesArray.clear();
    
    // Map template extended key usages to form values
    const extendedKeyUsageMapping: { [key: string]: string } = {
      'SERVER_AUTH': 'serverAuth',
      'CLIENT_AUTH': 'clientAuth',
      'CODE_SIGNING': 'codeSigning',
      'EMAIL_PROTECTION': 'emailProtection',
      'TIME_STAMPING': 'timeStamping',
      'OCSP_SIGNING': 'ocspSigning',
      'SMARTCARD_LOGON': 'smartcardLogon'
    };

    template.extendedKeyUsage.forEach(eku => {
      const formValue = extendedKeyUsageMapping[eku];
      if (formValue) {
        extendedKeyUsagesArray.push(new FormControl(formValue));
      }
    });

    this.showFeedback(`Šablon "${template.name}" primenjen!`, 'success');
  }

  clearTemplate() {
    this.selectedTemplate = null;
    this.certForm.patchValue({ templateId: '' });
    this.cnValidationMessage = '';
    this.sanValidationMessage = '';
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

    // Automatically set start date to the later of today or CA's start date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison
    const caStartDate = new Date(issuer.startDate);
    caStartDate.setHours(0, 0, 0, 0);
    
    const newStartDate = today > caStartDate ? today : caStartDate;
    
    // Calculate the maximum possible end date
    const calculatedMaxEndDate = new Date(newStartDate);
    calculatedMaxEndDate.setDate(calculatedMaxEndDate.getDate() + issuer.maxTTL);
    
    // The actual max end date is the minimum of calculated maxEndDate and CA's endDate
    const effectiveMaxEndDate = calculatedMaxEndDate > issuer.endDate ? issuer.endDate : calculatedMaxEndDate;

    // Set both start and end dates
    this.certForm.patchValue({ 
      startDate: this.formatDateForInput(newStartDate),
      endDate: this.formatDateForInput(effectiveMaxEndDate)
    });

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

  onCNChange() {
    const cnValue = this.certForm.value.cn;
    this.validateCN(cnValue);
  }

  onSANChange() {
    const sanList = this.certForm.value.sanList;
    this.validateSAN(sanList);
  }

  validateCN(cnValue: string) {
    if (!this.selectedTemplate?.commonNameRegex || !cnValue) {
      this.cnValidationMessage = '';
      return;
    }

    try {
      const regex = new RegExp(this.selectedTemplate.commonNameRegex);
      console.log('CN Validation:', {
        cnValue: cnValue,
        regex: this.selectedTemplate.commonNameRegex,
        testResult: regex.test(cnValue)
      });
      
      if (regex.test(cnValue)) {
        this.cnValidationMessage = '✓ Common Name je validan';
      } else {
        this.cnValidationMessage = '✗ Common Name ne odgovara regex-u';
      }
    } catch (error) {
      console.error('Regex error:', error);
      this.cnValidationMessage = '✗ Greška u regex-u';
    }
  }

  validateSAN(sanList: string[]) {
    if (!this.selectedTemplate?.sanRegex || !sanList || sanList.length === 0) {
      this.sanValidationMessage = '';
      return;
    }

    try {
      const regex = new RegExp(this.selectedTemplate.sanRegex);
      console.log('SAN Validation:', {
        sanList: sanList,
        regex: this.selectedTemplate.sanRegex
      });
      
      const validSans = sanList.filter(san => san && san.trim() !== '' && regex.test(san));
      const invalidSans = sanList.filter(san => san && san.trim() !== '' && !regex.test(san));

      console.log('SAN Results:', { validSans, invalidSans });

      if (invalidSans.length === 0) {
        this.sanValidationMessage = '✓ Svi SAN-ovi su validni';
      } else {
        this.sanValidationMessage = `✗ ${invalidSans.length} SAN-ova ne odgovara regex-u`;
      }
    } catch (error) {
      console.error('SAN Regex error:', error);
      this.sanValidationMessage = '✗ Greška u regex-u';
    }
  }

  get selectedIssuer() {
    const issuerId = this.certForm.get('issuerId')?.value;
    return this.issuers.find(i => i.id == issuerId);
  }

  isKeyUsageSelected(value: string): boolean {
    const keyUsagesArray = this.certForm.get('keyUsages') as FormArray;
    return keyUsagesArray.controls.some(control => control.value === value);
  }

  isExtendedKeyUsageSelected(value: string): boolean {
    const extendedKeyUsagesArray = this.certForm.get('extendedKeyUsages') as FormArray;
    return extendedKeyUsagesArray.controls.some(control => control.value === value);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onStartDateChange() {
    const startDate = new Date(this.certForm.value.startDate);
    const issuerId = this.certForm.value.issuerId;
    const issuer = this.issuers.find(i => i.id === issuerId);

    if (issuer) {
      // Ensure start date is not before CA's start date
      if (startDate < issuer.startDate) {
        this.certForm.patchValue({ startDate: this.formatDateForInput(issuer.startDate) });
        return;
      }

      // If issuer has max TTL constraint, adjust end date
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + issuer.maxTTL);

      // The actual max end date is the minimum of calculated maxEndDate and CA's endDate
      const effectiveMaxEndDate = maxEndDate > issuer.endDate ? issuer.endDate : maxEndDate;

      const currentEndDate = new Date(this.certForm.value.endDate);
      if (currentEndDate < startDate || currentEndDate > effectiveMaxEndDate) {
        this.certForm.patchValue({ endDate: this.formatDateForInput(effectiveMaxEndDate) });
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

      // The actual max end date is the minimum of calculated maxEndDate and CA's endDate
      const effectiveMaxEndDate = maxEndDate > issuer.endDate ? issuer.endDate : maxEndDate;

      if (endDate > effectiveMaxEndDate) {
        this.certForm.patchValue({ endDate: this.formatDateForInput(effectiveMaxEndDate) });
        return;
      }

      // Ensure end date is not after CA's end date
      if (endDate > issuer.endDate) {
        this.certForm.patchValue({ endDate: this.formatDateForInput(issuer.endDate) });
        return;
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
