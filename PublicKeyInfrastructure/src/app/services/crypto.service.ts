import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  pemToArrayBuffer(pem: string): ArrayBuffer {
    // .replace(/-----BEGIN PUBLIC KEY-----/, '')
    //   .replace(/-----END PUBLIC KEY-----/, '')
    //   .replace(/\s/g, '');
    const b64 = pem.replace(/-----(BEGIN|END) (PUBLIC|PRIVATE) KEY-----/g, '').replace(/\s/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Import public key from PEM
  async importPublicKey(pem: string): Promise<CryptoKey> {
    const keyBuffer = this.pemToArrayBuffer(pem);
    return window.crypto.subtle.importKey(
      'spki',
      keyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  }

  // Import private key from PEM
  async importPrivateKey(pem: string): Promise<CryptoKey> {
    const keyBuffer = this.pemToArrayBuffer(pem);
    return window.crypto.subtle.importKey(
      'pkcs8',
      keyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );
  }

  // Encrypt password with public key
  async encryptPassword(publicKeyPem: string, password: string): Promise<string> {
    const key = await this.importPublicKey(publicKeyPem);
    const encoded = new TextEncoder().encode(password);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      key,
      encoded
    );
    return this.arrayBufferToBase64(encrypted);
  }

  // Decrypt password with private key
  async decryptPassword(privateKeyPem: string, encryptedBase64: string): Promise<string> {
    const key = await this.importPrivateKey(privateKeyPem);
    const encrypted = this.base64ToArrayBuffer(encryptedBase64);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      key,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  }


  private ab2b64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  private bufToPem(buf: ArrayBuffer, label: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
    const b64 = this.ab2b64(buf);
    const lines = b64.match(/.{1,64}/g)?.join('\n');
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
  }

  async generateKeyPair(): Promise<{ publicPem: string, privatePem: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicPem: this.bufToPem(publicKey, 'PUBLIC KEY'),
      privatePem: this.bufToPem(privateKey, 'PRIVATE KEY'),
    };
  }

}
