import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginDetails } from '../models/login-details.model';
import { RecoveryData } from '../models/recovery-data.model';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/login-response.model';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string>('');
  public role$ = this.roleSubject.asObservable();
  
  constructor(private http : HttpClient, private router: Router) {
    this.loadRoleFromToken();
  }

  public register(user: User) : Observable<User> {
    return this.http.post<User>("https://localhost:8084/auth/register", user);
  }

  public login(loginDetails: LoginDetails) : Observable<LoginResponse> {
    return this.http.post<LoginResponse>("https://localhost:8084/auth/login", loginDetails)
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

  public registerCaUser(user: User, token: string): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.post<User>("https://localhost:8084/users/register-ca", user, {headers: headers});
  }

  public list(token: string): Observable<Session[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.get<Session[]>('https://localhost:8084/api/sessions', { headers: headers });
  }

  public revoke(sid: string, token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.delete<void>(`https://localhost:8084/api/sessions/${sid}`, { headers: headers});
  }

  public revokeAllExceptCurrent(token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json'
    });
    return this.http.post<void>(`https://localhost:8084/api/sessions/revoke-all-except-current`, {}, { headers: headers });
  }

  public getToken(): string {
    return localStorage.getItem("pki_token") || ''
  }
  getDecodedToken(): JwtPayload | null {
    const token = localStorage.getItem('pki_token');
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (e) {

      return null;
    }
  }

  public getEmail(): string {
    const decoded = this.getDecodedToken();

    if (decoded) {
      const email = decoded.sub;
      return email;
    }
    return ""
  }

  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token){
      localStorage.removeItem('pki_token');
      this.roleSubject.next('');
      return true; 
    }

    try {
      const decoded: any = jwtDecode(token);
      if (!decoded || !decoded.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      
      if (decoded.exp < now){
        localStorage.removeItem('pki_token');
        this.roleSubject.next('');
        return true; 
      }
      return decoded.exp < now;
    } catch (e) {
      localStorage.removeItem('pki_token');
      this.roleSubject.next('');
      return true; 
    }
  }

  public redirect(role: string) {
    if(this.isTokenExpired())
      this.router.navigate(["login"])
    if(this.getRole() === '')
      this.router.navigate(["login"])
    if(this.getRole() !== role)
        this.router.navigate(["login"])

  }

  private loadRoleFromToken(): void {
    const token = localStorage.getItem('pki_token');
    if (!token) return;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      this.roleSubject.next(decoded.role!);
    } catch (e) {
    }
  }

  public logout(): void {
    localStorage.removeItem('pki_token');
    this.roleSubject.next('');
    this.router.navigate(["login"])
  }

  public getRole(): string {
    return this.roleSubject.value;
  }

  public refreshRoleFromToken(): void {
    const token = localStorage.getItem('pki_token');
    if (!token) {
      this.roleSubject.next('');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      this.roleSubject.next(decoded.role);
    } catch (e) {
      this.roleSubject.next('');
    }
  }

  public getSidFromToken(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.sid ?? null;
  }


}

interface JwtPayload {
  sub: string;            
  role?: string;
  exp?: number;   
  sid?: string;        
}