import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient) { }

  public register(user: User) : Observable<User> {
    return this.http.post<User>("https://localhost:8084/auth/register", user);
  }
}
