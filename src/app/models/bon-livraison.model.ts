export type StatutBonLivraison =
  | 'DRAFT'
  | 'DELIVERED'
  | 'SIGNED_CLIENT'
  | 'DISPUTE'
  | 'CLOSED';

export interface LigneBonLivraison {
  id?: number;
  produitId?: number;
  produitDesignation?: string;
  quantite?: number;
}

export interface BonLivraison {
  id: number;
  numBonLivraison?: string;
  dateCreation?: string;
  dateLivraison?: string;
  acheteurId?: number;
  acheteurNom?: string;
  vendeurId?: number;
  vendeurNom?: string;
  adresseLivraison?: string;
  statut?: StatutBonLivraison | string;
  disputeReason?: string;
  commandeSourceRef?: string;
  factureRef?: string;
  lignes?: LigneBonLivraison[];
}
