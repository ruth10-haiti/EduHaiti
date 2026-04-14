// src/types/index.ts
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'bunexe' | 'secretariat' | 'parent';
  id_ecole?: number;
  doit_changer_mdp: boolean;
  email_verifie: boolean;
  derniere_connexion?: string;
}

export interface Examen {
  id: number;
  nom: string;
  annee: string;
  date_debut: string;
  date_fin: string;
  date_creation: string;
  total_inscriptions?: number;
}

export interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  id_ecole: number;
  ecole_nom?: string;
  classe: string;
  created_at: string;
}

export interface Inscription {
  id: number;
  id_eleve: number;
  date_inscription: string;
  statut: 'en_attente' | 'valide' | 'refuse';
  eleve_nom?: string;
  eleve_prenom?: string;
  ecole_nom?: string;
}

export interface InscriptionExamen {
  id: number;
  id_examen: number;
  id_eleve: number;
  date_inscription: string;
  statut: 'en_attente' | 'valide';
  examen_nom?: string;
  eleve_nom?: string;
  eleve_prenom?: string;
}

export interface Resultat {
  id: number;
  id_examen: number;
  id_eleve: number;
  note: number;
  statut: 'ADMIS' | 'ECHEC';
  date_publication: string;
  examen_nom?: string;
  eleve_nom?: string;
  eleve_prenom?: string;
}