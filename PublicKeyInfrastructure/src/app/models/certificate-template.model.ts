import { KeyUsage } from './key-usage.enum';
import { ExtendedKeyUsage } from './extended-key-usage.enum';

export interface CertificateTemplateRequestDTO {
  name: string;
  issuerAlias: string;
  commonNameRegex?: string;
  sanRegex?: string;
  ttlDays: number;
  keyUsage: KeyUsage[];
  extendedKeyUsage: ExtendedKeyUsage[];
  enabled: boolean;
}

export interface CertificateTemplateResponseDTO {
  id: number;
  userId: number;
  name: string;
  issuerAlias: string;
  commonNameRegex?: string;
  sanRegex?: string;
  ttlDays: number;
  keyUsage: KeyUsage[];
  extendedKeyUsage: ExtendedKeyUsage[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}









