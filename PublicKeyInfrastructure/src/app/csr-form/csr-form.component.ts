import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CsrService } from '../services/csr-service';
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

  issuers: string[] = [];
  issuing = false;
  generatedCsr: string | null = null;
  generatedKey: string | null = null;
  issuedCert: string | null = null;
  issuedChain: string | null = null;
  error: string | null = null;

  form!: FormGroup;

  static dateRangeValidator(group: any) {
    const nb = new Date(group.get('notBefore')?.value);
    const na = new Date(group.get('notAfter')?.value);
    if (!nb || !na || isNaN(nb.getTime()) || isNaN(na.getTime())) return null;
    return nb < na ? null : { dateRange: true };
  }

  constructor(private fb: FormBuilder, private csr: CsrService, private api: ApiService) {}

  ngOnInit() {
    this.form = this.fb.group({
    // Subject
    cn: ['', [Validators.required]],
    o: [''],
    ou: [''],
    c: ['RS', [Validators.maxLength(2)]],
    email: ['', [Validators.email]],

    // SAN (zarezom odvojeni)
    sanDns: [''],
    sanIp: [''],

    // Crypto
    modulusLength: [2048, [Validators.required]],
    hash: ['SHA-256', [Validators.required]],
    extractable: [true], // dozvoli preuzimanje .key

    // Issuance
    issuerAlias: ['', [Validators.required]],
    notBefore: ['', [Validators.required]],
    notAfter: ['', [Validators.required]],
  }, { validators: [CsrFormComponent.dateRangeValidator] });


    this.api.listIssuers().subscribe({
      next: aliases => this.issuers = aliases,
      error: () => this.issuers = []
    });
  }

  async onGenerate() {
    this.error = null;
    this.generatedCsr = null;
    this.generatedKey = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const dns: string[] = (v.sanDns ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((x: string) => x.length > 0);

    const ips: string[] = (v.sanIp ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((x: string) => x.length > 0);

    try {
      const { csrPem, privateKeyPkcs8 } = await this.csr.createCsr({
        cn: v.cn!, o: v.o ?? undefined, ou: v.ou ?? undefined, c: v.c ?? undefined, email: v.email ?? undefined,
        sanDns: dns, sanIp: ips,
        modulusLength: Number(v.modulusLength) as any,
        hash: v.hash as any,
        extractable: !!v.extractable
      });
      this.generatedCsr = csrPem;
      this.generatedKey = privateKeyPkcs8 ?? null;
    } catch (e: any) {
      this.error = 'Greška pri generisanju CSR-a: ' + (e?.message || e);
    }
  }

  onDownload(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  onIssue() {
    if (!this.generatedCsr) { this.error = 'Prvo generiši CSR.'; return; }

    this.issuing = true;
    this.issuedCert = null;
    this.issuedChain = null;
    this.error = null;

    const v = this.form.value;
    this.api.issueEndEntity({
      csrPem: this.generatedCsr,
      issuerAlias: v.issuerAlias!,
      notBefore: new Date(v.notBefore!).toISOString(),
      notAfter: new Date(v.notAfter!).toISOString()
    }).subscribe({
      next: (res) => {
        this.issuedCert = res.certificatePem;
        this.issuedChain = res.chainPem ?? null;
        this.issuing = false;
      },
      error: (err) => {
        this.error = 'Greška pri izdavanju: ' + (err?.error?.message || err?.message || err);
        this.issuing = false;
      }
    });
  }
}
