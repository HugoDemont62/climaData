export type Commune = {
  insee: string;
  nom: string;
  littoral: boolean;
};

export type IndicateurCode = "canicule" | "nuits_chaudes" | "stress_hydrique" | "biodiversite";

export type Indicateur = {
  code: IndicateurCode;
  libelle: string;
  unite: string;
  horizons: { "2030": number; "2040": number; "2050": number };
  source: string;
};

export type CommuneData = {
  commune: Commune;
  scenario: string;
  indicateurs: Indicateur[];
};

export type Simulation = {
  commune: string;
  scenario: string;
  vegetalisation: number;
  reference: Record<string, number>;
  simule: Record<string, number>;
  delta: Record<string, number>;
};

export type Scenario = "RCP4.5" | "RCP8.5";
