import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Password } from '../models/password.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  constructor(private http: HttpClient) { }

  savePassword(password: Password, token: string): Observable<Password> {
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.post<Password>('https://localhost:8084/password/save-password', password, {headers: headers});
  }

  getAllForUser(token: string): Observable<Password[]> {
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.get<Password[]>('https://localhost:8084/password/for-user', {headers: headers});
  }

  savePublicKey(token: string, publicKey: string) {
    return this.http.post('https://localhost:8084/password/save-key', publicKey, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain' 
      },
      responseType: 'text'
    });
  }


  getPublickey(token: string): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  
    });
    return this.http.get(`https://localhost:8084/password/load-key/`, {  headers: headers, responseType: 'text'})
  }

  getPublickeyByEmail(token: string, email: string): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  
    });
    return this.http.get(`https://localhost:8084/password/load-key/${email}`, {  headers: headers, responseType: 'text'})
  }  

  saveSharedPassword(password: Password, token: string): Observable<Password> {
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.post<Password>(`https://localhost:8084/password/save-shared-password`, password, {headers: headers});
  }

  getAllSharedForUser(token: string): Observable<Password[]> {
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.get<Password[]>('https://localhost:8084/password/shared-for-user', {headers: headers});
  }
}
