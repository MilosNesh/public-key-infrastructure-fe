import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CertificateResponse } from '../models/certificate-response';
import { CommonModule } from '@angular/common';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-certificate-item',
  imports: [DatePipe, CommonModule],
  templateUrl: './certificate-item.component.html',
  styleUrl: './certificate-item.component.css'
})
export class CertificateItemComponent {
   @Input() cert!: CertificateResponse;
   certType: String = '';

ngOnChanges(changes: SimpleChanges): void {
    if (changes['cert'] && this.cert) {
      this.certType = this.determineCertificateType(this.cert);
    }
  }

  public determineCertificateType(cert: CertificateResponse): string {
    if (cert.isCA) {
      if (cert.issuerDN === cert.subjectDN) {
        return 'ROOT CA';
      } else {
        return 'INTERMEDIATE CA';
      }
    } else {
      return 'END ENTITY';
    }
  }

  // Helper method to format arrays for display
  formatArray(arr: string[]): string {
    return arr && arr.length > 0 ? arr.join(', ') : 'N/A';
  }

  // Helper method to check if certificate is CA
  isCertificateCA(): boolean {
    return this.cert?.isCA === true;
  }

  // Helper method to get key size display
  getKeySizeDisplay(): string {
    if (this.cert?.publicKeySize) {
      return `${this.cert.publicKeySize} bit`;
    }
    return 'EC';
  }

  // Wrap base64 into PEM format (64 chars per line)
  toPem(b64: string): string {
    if (!b64) return '';
    const wrap = (s: string, width = 64) =>
      s.replace(new RegExp(`(.{1,${width}})`, 'g'), '$1\n').trim();
    return `-----BEGIN CERTIFICATE-----\n${wrap(b64)}\n-----END CERTIFICATE-----\n`;
  }

  // Download PEM file
  downloadPem(): void {
    const pem = this.toPem(this.cert.certificatePEM);
    const blob = new Blob([pem], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.safeFileName(this.cert.alias || 'certificate')}.pem`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Copy PEM to clipboard
  async copyPem(): Promise<void> {
    try {
      const pem = this.toPem(this.cert.certificatePEM);
      await navigator.clipboard.writeText(pem);
      this.flash('PEM je kopiran u clipboard.');
    } catch (err) {
      console.error(err);
      this.flash('Kopiranje nije uspelo — pogledaj konzolu.');
    }
  }

  // Optional: download DER (binary) as .crt
  downloadDer(): void {
    try {
      const b64 = this.cert.certificatePEM;
      const binary = atob(b64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: 'application/x-x509-ca-cert' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.safeFileName(this.cert.alias || 'certificate')}.crt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      this.flash('Preuzimanje DER nije uspelo.');
    }
  }

  // Small user notification (replace with Toast if you have one)
  private flash(msg: string): void {
    // minimal: alert; replace with your toast/notification system
    // alert(msg);
    // Better: small non-blocking message element could be implemented.
    console.log(msg);
  }

  // Helper: compute days between
  daysBetween(): number {
    // Use ttlDays if available from backend
    if (this.cert?.ttlDays) {
      return this.cert.ttlDays;
    }

    // Fallback to calculation if ttlDays not available
    if (!this.cert?.notBefore || !this.cert?.notAfter) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((this.cert.notAfter - this.cert.notBefore) / msPerDay);
  }

  // Safe filename (remove spaces/special chars)
  private safeFileName(name: string): string {
    return name.replace(/[^a-z0-9_\-\.]/gi, '-').toLowerCase();
  }
}
