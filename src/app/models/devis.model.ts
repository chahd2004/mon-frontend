export type StatutDevis =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED'
  | string;

export interface Devis {
  id: number;
  numDevis: string;
  dateCreation: string;
  dateValidite?: string | null;
  acheteurId: number;
  acheteurNom: string;
  vendeurId: number;
  vendeurNom: string;
  statut: StatutDevis;
  totalHT: number;
  montantTVA: number;
  totalTTC: number;
  montantEnLettres?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  documentConvertiRef?: string | null;
  lignes?: LigneDevis[];
}

export interface LigneDevis {
  id?: number;
  produitId?: number;
  produitDesignation?: string;
  quantite?: number;
  prixUnitaire?: number;
  montantHT?: number;
}

export interface LigneDevisRequest {
  produitId: number;
  quantite: number;
}

export interface DevisRequest {
  dateCreation: string;
  acheteurId: number;
  typeAcheteur: 'CLIENT' | 'EMETTEUR';
  vendeurId: number;
  notes?: string;
  lignes: LigneDevisRequest[];
}
