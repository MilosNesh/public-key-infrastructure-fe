// src/app/services/api.service.ts
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CsrUploadResponse } from '../models/csr-upload-response.model';
import { CertificateResponse } from '../models/certificate-response';
import { ExtendedRequest } from '../models/extended-request';
import { CAWithValidityDTO } from '../models/ca-with-validity.model';
import { CsrResponseDTO } from '../models/csr-response.model';
import { CertificateTemplateRequestDTO, CertificateTemplateResponseDTO } from '../models/certificate-template.model';
import { TemplateDropdownDTO } from '../models/template-dropdown.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private backendUrl = 'https://localhost:8084'; // Backend HTTPS URL

  constructor(private http: HttpClient,  private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();

    return {
      headers: { Authorization: `Bearer ${token}`}
    };
  }

  uploadCSR(file: File, userId: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());

    return this.http.post<CsrUploadResponse>(`${this.backendUrl}/api/csr`, formData, this.getAuthHeaders());
  }

  uploadCSRWithCertificate(file: File, issuerAlias: string, startDate: string, endDate: string): Observable<CsrUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('issuerAlias', issuerAlias);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);

    return this.http.post<CsrUploadResponse>(`${this.backendUrl}/api/csr`, formData, this.getAuthHeaders());
  }

  listIssuers() {
    return this.http.get<string[]>(`${this.backendUrl}/api/ca/issuers`, this.getAuthHeaders());
  }

  getAllRootCertificates() {
    return this.http.get<CertificateResponse[]>(`${this.backendUrl}/api/ca/all`, this.getAuthHeaders());
  }

  getValidCACertificates(): Observable<CAWithValidityDTO[]> {
    return this.http.get<CAWithValidityDTO[]>(`${this.backendUrl}/api/ca/valid-ca-aliases`, this.getAuthHeaders());
  }

  createRootCA(request: ExtendedRequest): Observable<CertificateResponse> {
    return this.http.post<CertificateResponse>(`${this.backendUrl}/api/ca/root`, request, this.getAuthHeaders());
  }

  getAllEndEntityCertificates(){
    return this.http.get<CertificateResponse[]>(`${this.backendUrl}/api/ca/end-entity`, this.getAuthHeaders());
  }

  getCsrsByUserId(): Observable<CsrResponseDTO[]> {
    return this.http.get<CsrResponseDTO[]>(`${this.backendUrl}/api/csr/user`, this.getAuthHeaders());
  }

  approveCSR(csrId: number, issuerAlias: string): Observable<CertificateResponse> {
    const params = {
      issuerAlias: issuerAlias
    };
    return this.http.post<CertificateResponse>(`${this.backendUrl}/api/csr/${csrId}/approve`, null, {
      ...this.getAuthHeaders(),
      params
    });
  }

  createCertificateTemplate(request: CertificateTemplateRequestDTO): Observable<CertificateTemplateResponseDTO> {
    return this.http.post<CertificateTemplateResponseDTO>(`${this.backendUrl}/api/templates`, request, this.getAuthHeaders());
  }

  getTemplatesForDropdown(): Observable<TemplateDropdownDTO[]> {
    return this.http.get<TemplateDropdownDTO[]>(`${this.backendUrl}/api/templates/dropdown`, this.getAuthHeaders());
  }

  getTemplateById(id: number): Observable<CertificateTemplateResponseDTO> {
    return this.http.get<CertificateTemplateResponseDTO>(`${this.backendUrl}/api/templates/${id}`, this.getAuthHeaders());
  }

  getOrganization(): Observable<{organization: string}> {
    console.log('API: getOrganization called');
    console.log('API: Auth headers:', this.getAuthHeaders());
    return this.http.get<{organization: string}>(`${this.backendUrl}/users/organization`, this.getAuthHeaders());
  }
}
