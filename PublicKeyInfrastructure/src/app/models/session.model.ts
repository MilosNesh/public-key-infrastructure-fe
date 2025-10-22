export interface Session {
  sid: string;
  ip: string;
  userAgent: string;
  deviceType?: string | null;
  os?: string | null;
  browser?: string | null;
  createdAt: string;
  lastActivityAt: string;
  revoked: boolean;
}
