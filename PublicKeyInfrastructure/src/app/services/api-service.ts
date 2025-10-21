// src/app/services/api.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CsrUploadResponse } from '../models/csr-upload-response.model';
import { CertificateResponse } from '../models/certificate-response';
import { ExtendedRequest } from '../models/extended-request';
import { CAWithValidityDTO } from '../models/ca-with-validity.model';
import { CsrResponseDTO } from '../models/csr-response.model';

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

  uploadCSRWithCertificate(file: File, issuerAlias: string, startDate: string, endDate: string): Observable<CsrUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('issuerAlias', issuerAlias);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);

    return this.http.post<CsrUploadResponse>(`${this.backendUrl}/api/csr`, formData);
  }

  listIssuers() {
    return this.http.get<string[]>(`${this.backendUrl}/api/ca/issuers`);
  }

  getAllRootCertificates() {
    return this.http.get<CertificateResponse[]>(`${this.backendUrl}/api/ca/all`);
  }

  getValidCACertificates(): Observable<CAWithValidityDTO[]> {
    return this.http.get<CAWithValidityDTO[]>(`${this.backendUrl}/api/ca/valid-ca-aliases`);
  }

  createRootCA(request: ExtendedRequest): Observable<CertificateResponse> {
    return this.http.post<CertificateResponse>(`${this.backendUrl}/api/ca/root`, request);
  }

  getAllEndEntityCertificates(){
    return this.http.get<CertificateResponse[]>(`${this.backendUrl}/api/ca/end-entity`);
  }

  getCsrsByUserId(): Observable<CsrResponseDTO[]> {
    return this.http.get<CsrResponseDTO[]>(`${this.backendUrl}/api/csr/user`);
  }
}
