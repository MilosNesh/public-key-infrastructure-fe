// src/app/services/api.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CsrUploadResponse } from '../models/csr-upload-response.model';
import { CertificateResponse } from '../models/certificate-response';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private backendUrl = 'https://localhost:8084'; // Backend HTTPS URL

  constructor(private http: HttpClient) {}

  uploadCSR(file: File, userId: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());

    return this.http.post<CsrUploadResponse>(`${this.backendUrl}/api/csr`, formData);
  }

  listIssuers() {
    return this.http.get<string[]>(`${this.backendUrl}/api/ca/issuers`);
  }

  getAllRootCertificates() {
    return this.http.get<CertificateResponse[]>(`${this.backendUrl}/api/ca/all`);
  }
}
