export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  role?: 'ADMIN' | 'USER';
  typeUser?: 'CLIENT' | 'EMETTEUR' | null;
  // Champs Client (requis si typeUser = CLIENT)
  raisonSociale?: string;
  adresseComplete?: string;
  region?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: 'ADMIN' | 'USER';
  typeUser: 'CLIENT' | 'EMETTEUR' | null;
}

export interface UserDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'ADMIN' | 'USER';
  typeUser: 'CLIENT' | 'EMETTEUR' | null;
  enabled: boolean;
  clientId?: number;
  emetteurId?: number;
}