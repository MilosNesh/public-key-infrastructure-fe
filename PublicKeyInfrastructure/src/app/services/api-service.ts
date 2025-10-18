// src/app/services/api.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  issueEndEntity(body: {
    csrPem: string;
    issuerAlias: string;
    notBefore: string; // ISO
    notAfter: string;  // ISO
  }) {
    return this.http.post<{ certificatePem: string; chainPem?: string }>(
      '/api/certificates/end-entity/issue', body
    );
  }

  listIssuers() {
    return this.http.get<string[]>('/api/ca/issuers'); // vrati listu aliasa (npr. ["ehej-ca","intermediate-ca-6"])
  }
}
