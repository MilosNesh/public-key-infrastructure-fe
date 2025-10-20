export interface AdditionalExtension {
  name: string;
  value: string;
  critical?: boolean;
}

export interface CertificateResponse {
  alias: string;                // alias u keystore-u / identifikator
  issuerAlias: string;          // alias izdavaoca u sistemu

  // DN i izdvojena subject polja (korisno za UI)
  subjectDN: string;            // Distinguished Name (kompletan)
  commonName: string;
  organization: string;
  organizationalUnit: string;
  country: string;
  email: string;

  issuerDN: string;             // Distinguished Name izdavaoca

  // serijski i validnost
  serialNumber: string;
  notBefore: number;            // epoch millis
  notAfter: number;             // epoch millis
  ttlDays: number;              // opcionalno

  // CA info
  isCA: boolean;
  pathLength: number;

  // SAN, key usages i ekstenzije
  sanList: string[];
  keyUsages: string[];
  extendedKeyUsages: string[];
  additionalExtensions: AdditionalExtension[];

  // PEM / DER i lanac
  certificatePEM: string;            // Base64 PEM (-----BEGIN CERTIFICATE-----...)

  // Public key i signature info
  publicKeyAlgorithm: string;
  publicKeySize: number;           // npr. 2048, 3072, 4096, ili null za EC
  signatureAlgorithm: string;

  // opcionalno: poruka ili upozorenja prilikom izdavanja
  message: string;
}
