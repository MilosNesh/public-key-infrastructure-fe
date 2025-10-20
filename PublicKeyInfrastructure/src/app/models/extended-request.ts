// src/app/models/extended-request.model.ts

export interface AdditionalExtension {
  name: string;
  value: string;
  // opcionalno možeš dodati oid, critical flag, rawValue itd.
  // oid?: string;
  // critical?: boolean;
}

export interface ExtendedRequest {
  issuerAlias?: string;

  // subject fields
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  country?: string;
  email?: string;

  // datum početka i završetka važenja (format: "yyyy-MM-dd")
  startDate: string;
  endDate: string;

  // alternativno polje — možeš izračunavati iz start/end
  ttlDays?: number;

  // serijski broj
  serialNumber?: string;

  // ako je CA, maksimalna path length
  pathLength?: number;
  isCA?: boolean;

  sanList?: string[];

  keyUsages?: string[];
  extendedKeyUsages?: string[];

  // dodatne ekstenzije
  additionalExtensions?: AdditionalExtension[];

  // template podaci
  applyTemplateId?: number;
  saveAsTemplate?: boolean;
}
