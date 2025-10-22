// src/app/pages/sessions/sessions.component.ts
import { Component, OnInit } from '@angular/core';
import { Session } from '../../models/session.model';
import { AuthService } from '../auth.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-session',
  imports: [DatePipe, CommonModule],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css'
})
export class SessionsComponent implements OnInit {
  sessions: Session[] = [];
  loading = false;
  error: string | null = null;
  currentSid: string | null = null;

  public constructor(private authService: AuthService) {}

  public ngOnInit(): void {
    this.currentSid = this.authService.getSidFromToken();
    this.load();
  }

  public load(): void {
    this.loading = true;
    this.authService.list(this.authService.getToken()).subscribe({
      next: (data) => { this.sessions = data; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Neuspelo učitavanje.'; this.loading = false; }
    });
  }

  public isCurrent(s: Session): boolean {
    return !!this.currentSid && s.sid === this.currentSid;
  }

  public labelFor(s: Session): string {
    if (s.browser && s.os) return `${s.browser} on ${s.os}`;
    if (s.browser) return s.browser;
    if (s.os) return s.os;
    return s.userAgent || 'Unknown device';
  }

  public revokeOne(s: Session): void {
    if (this.isCurrent(s) && !confirm('Odjava sa ovog uređaja?')) return;
    this.authService.revoke(s.sid, this.authService.getToken()).subscribe({
      next: () => this.load(),
      error: () => alert('Nije uspelo opozivanje sesije.')
    });
  }

  public revokeOthers(): void {
    if (!confirm('Odjava sa svih drugih uređaja?')) return;
    this.authService.revokeAllExceptCurrent(this.authService.getToken()).subscribe({
      next: () => this.load(),
      error: () => alert('Nije uspelo opozivanje drugih sesija.')
    });
  }
}
