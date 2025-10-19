export interface CertificateResponse {
  alias: string;
  subjectDN: string;
  issuerDN: string;
  serialNumber: string;
  notBefore: number; // epoch millis
  notAfter: number;  // epoch millis
  certificatePEM: string; // Base64 string (bez header/footer i bez \n)
  message: string;
}
