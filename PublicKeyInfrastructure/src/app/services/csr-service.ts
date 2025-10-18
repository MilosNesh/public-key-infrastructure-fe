// src/app/services/csr.service.ts
import { Injectable } from '@angular/core';
import * as asn1js from 'asn1js';
import * as pkijs from 'pkijs';

@Injectable({ providedIn: 'root' })
export class CsrService {
  private crypto = new Crypto();
  constructor() {
    // Podešavanje PKI.js engine-a za browser
    // @ts-ignore
    if (!('crypto' in window)) (window as any).crypto = this.crypto as any;
    // @ts-ignore
    if (!('SubtleCrypto' in window)) (window as any).SubtleCrypto = (this.crypto as any).subtle;
    pkijs.setEngine('web', (window as any).crypto, (window as any).crypto.subtle);
  }

  async createCsr(options: {
    cn: string; o?: string; ou?: string; c?: string; email?: string;
    sanDns?: string[]; sanIp?: string[];
    hash?: 'SHA-256' | 'SHA-384';
    modulusLength?: 2048 | 3072 | 4096;
    extractable?: boolean; // ako želiš da korisnik preuzme .key
  }) {
    const hash = options.hash ?? 'SHA-256';

    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: options.modulusLength ?? 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash
      },
      options.extractable ?? true,
      ['sign', 'verify']
    );

    // Subject (X500Name)
    const rdns: Array<{ type: string; value: string }> = [];
    const push = (t: string, v?: string) => v && rdns.push({ type: t, value: v });
    push('2.5.4.3', options.cn);          // CN
    push('2.5.4.10', options.o);          // O
    push('2.5.4.11', options.ou);         // OU
    push('2.5.4.6', options.c);           // C
    push('1.2.840.113549.1.9.1', options.email); // emailAddress

    const csr = new pkijs.CertificationRequest();
    csr.version = 0;
    csr.subject.typesAndValues = rdns.map(
      r => new pkijs.AttributeTypeAndValue({ type: r.type, value: new asn1js.PrintableString({ value: r.value }) })
    );
    await csr.subjectPublicKeyInfo.importKey(keyPair.publicKey);

    // SAN (opciono)
    const altNames: pkijs.GeneralName[] = [];
    (options.sanDns ?? []).forEach(d => altNames.push(new pkijs.GeneralName({ type: 2, value: d })));
    (options.sanIp ?? []).forEach(ip => altNames.push(new pkijs.GeneralName({ type: 7, value: new asn1js.OctetString({ valueHex: this.ipToBytes(ip) }) })));

    if (altNames.length) {
      const sanExt = new pkijs.Extension({
        extnID: '2.5.29.17',
        critical: false,
        extnValue: (new pkijs.GeneralNames({ names: altNames })).toSchema().toBER(false)
      });
      const attrs = new pkijs.Attribute({
        type: '1.2.840.113549.1.9.14', // extensionRequest
        values: [new pkijs.Extensions({ extensions: [sanExt] }).toSchema()]
      });
      csr.attributes = [attrs];
    }

    await csr.sign(keyPair.privateKey, hash);

    const csrDer = csr.toSchema(true).toBER(false);
    const csrPem = this.derToPem(csrDer, 'CERTIFICATE REQUEST');

    // Privatni ključ → PKCS#8 (ako je extractable)
    let privateKeyPkcs8: string | null = null;
    if (options.extractable ?? true) {
      const pkcs8 = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      privateKeyPkcs8 = this.derToPem(new Uint8Array(pkcs8), 'PRIVATE KEY');
    }

    return { csrPem, privateKeyPkcs8 };
  }

  private derToPem(der: ArrayBuffer | Uint8Array, label: string) {
    const bytes = der instanceof Uint8Array ? der : new Uint8Array(der);
    const b64 = btoa(String.fromCharCode(...bytes));
    const lines = b64.match(/.{1,64}/g)?.join('\n') ?? b64;
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
  }

  private ipToBytes(ip: string): ArrayBuffer {
    const parts = ip.split('.').map(x => parseInt(x, 10));
    return new Uint8Array(parts).buffer;
  }
}
