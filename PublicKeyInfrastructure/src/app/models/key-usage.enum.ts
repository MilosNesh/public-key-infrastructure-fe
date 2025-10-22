export enum KeyUsage {
  DIGITAL_SIGNATURE = 'DIGITAL_SIGNATURE',
  NON_REPUDIATION = 'NON_REPUDIATION',
  KEY_ENCIPHERMENT = 'KEY_ENCIPHERMENT',
  DATA_ENCIPHERMENT = 'DATA_ENCIPHERMENT',
  KEY_AGREEMENT = 'KEY_AGREEMENT',
  KEY_CERT_SIGN = 'KEY_CERT_SIGN',
  CRL_SIGN = 'CRL_SIGN',
  ENCIPHER_ONLY = 'ENCIPHER_ONLY',
  DECIPHER_ONLY = 'DECIPHER_ONLY'
}

export const KEY_USAGE_LABELS: { [key in KeyUsage]: string } = {
  [KeyUsage.DIGITAL_SIGNATURE]: 'Digital Signature',
  [KeyUsage.NON_REPUDIATION]: 'Non Repudiation',
  [KeyUsage.KEY_ENCIPHERMENT]: 'Key Encipherment',
  [KeyUsage.DATA_ENCIPHERMENT]: 'Data Encipherment',
  [KeyUsage.KEY_AGREEMENT]: 'Key Agreement',
  [KeyUsage.KEY_CERT_SIGN]: 'Key Cert Sign',
  [KeyUsage.CRL_SIGN]: 'CRL Sign',
  [KeyUsage.ENCIPHER_ONLY]: 'Encipher Only',
  [KeyUsage.DECIPHER_ONLY]: 'Decipher Only'
};









