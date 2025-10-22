export enum ExtendedKeyUsage {
  SERVER_AUTH = 'SERVER_AUTH',
  CLIENT_AUTH = 'CLIENT_AUTH',
  CODE_SIGNING = 'CODE_SIGNING',
  EMAIL_PROTECTION = 'EMAIL_PROTECTION',
  TIME_STAMPING = 'TIME_STAMPING',
  OCSP_SIGNING = 'OCSP_SIGNING',
  SMARTCARD_LOGON = 'SMARTCARD_LOGON'
}

export const EXTENDED_KEY_USAGE_LABELS: { [key in ExtendedKeyUsage]: string } = {
  [ExtendedKeyUsage.SERVER_AUTH]: 'TLS Web Server Authentication',
  [ExtendedKeyUsage.CLIENT_AUTH]: 'TLS Web Client Authentication',
  [ExtendedKeyUsage.CODE_SIGNING]: 'Code Signing',
  [ExtendedKeyUsage.EMAIL_PROTECTION]: 'Email Protection (S/MIME)',
  [ExtendedKeyUsage.TIME_STAMPING]: 'Time Stamping',
  [ExtendedKeyUsage.OCSP_SIGNING]: 'OCSP Signing',
  [ExtendedKeyUsage.SMARTCARD_LOGON]: 'Smartcard Logon'
};





