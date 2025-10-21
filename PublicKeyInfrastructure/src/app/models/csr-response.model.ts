export interface CsrResponseDTO {
  id: number;
  userId: number;
  csrPem: string;  // CSR u PEM formatu
  status: string;
  issuerAlias: string;
  startDate: number; // timestamp
  endDate: number;   // timestamp
  certificatePath?: string;
}

