import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { LoginDetails } from '../models/login-details.model';
import { RecoveryData } from '../models/recovery-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient) { }

  public register(user: User) : Observable<User> {
    return this.http.post<User>("https://localhost:8084/auth/register", user);
  }

  public login(loginDetails: LoginDetails) : Observable<string> {
    return this.http.post("https://localhost:8084/auth/login", loginDetails, { responseType: 'text'})
  }

  public recover(recoveryData: RecoveryData, token: string): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.post("https://localhost:8084/auth/recover", recoveryData,  {  headers: headers, responseType: 'text'})
  }

  public sendLink(email: string): Observable<string> {
    return this.http.post("https://localhost:8084/auth/recoverylink", email,  {  responseType: 'text'})
  }
}
