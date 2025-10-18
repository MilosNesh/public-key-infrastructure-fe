# Sample CSR Files

Ovaj folder sadrži primer CSR (Certificate Signing Request) fajlova za testiranje.

## Fajlovi:

- **sample-request.csr** - Primer CSR fajla u PEM formatu

## Kako koristiti:

1. U aplikaciji, otvorite CSR formu
2. Upload-ujte `sample-request.csr` fajl
3. Odaberite CA (npr. Root CA)
4. Unesite trajanje (npr. 1 godina)
5. Pošaljite zahtev

## Generisanje pravog CSR-a sa OpenSSL:

```bash
# Generiši privatni ključ
openssl genrsa -out private.key 2048

# Generiši CSR
openssl req -new -key private.key -out request.csr \
  -subj "/C=RS/ST=Vojvodina/L=Novi Sad/O=FTN/OU=IT/CN=example.com/emailAddress=test@example.com"
```

## Struktura CSR-a:

CSR sadrži:
- **Subject (X500Name)**: CN, O, OU, C, Email, itd.
- **Public Key**: Javni ključ end-entity korisnika
- **Extensions**: SAN (Subject Alternative Name), Key Usage, itd.
- **Signature**: Potpis CSR-a privatnim ključem korisnika

