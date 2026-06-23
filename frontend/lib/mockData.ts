import type { CommuneData, Simulation } from "./types";

export const DEMO_COMMUNES = [
  { code_postal: "59000", nom: "Lille",           insee: "59350" },
  { code_postal: "75001", nom: "Paris",           insee: "75056" },
  { code_postal: "13001", nom: "Marseille",       insee: "13055" },
  { code_postal: "17000", nom: "La Rochelle",     insee: "17300" },
  { code_postal: "33000", nom: "Bordeaux",        insee: "33063" },
  { code_postal: "97200", nom: "Fort-de-France",  insee: "97209" },
];

export const MOCK_COMMUNE_DATA: Record<string, CommuneData> = {
  "59350": {
    commune: { insee: "59350", nom: "Lille", littoral: false },
    scenario: "RCP4.5",
    indicateurs: [
      { code: "canicule",       libelle: "Jours de forte chaleur (TX > 35 °C)", unite: "jours/an",      horizons: { "2030": 9,  "2040": 14, "2050": 21 }, source: "DRIAS" },
      { code: "nuits_chaudes",  libelle: "Nuits chaudes (> 20 °C)",             unite: "nuits/an",      horizons: { "2030": 12, "2040": 19, "2050": 30 }, source: "DRIAS" },
      { code: "stress_hydrique",libelle: "Stress hydrique",                     unite: "indice (0-100)",horizons: { "2030": 25, "2040": 32, "2050": 40 }, source: "DRIAS-Eau" },
      { code: "biodiversite",   libelle: "Pression sur la biodiversité",        unite: "indice (0-100)",horizons: { "2030": 30, "2040": 38, "2050": 47 }, source: "INPN" },
    ],
  },
  "75056": {
    commune: { insee: "75056", nom: "Paris", littoral: false },
    scenario: "RCP4.5",
    indicateurs: [
      { code: "canicule",       libelle: "Jours de forte chaleur (TX > 35 °C)", unite: "jours/an",      horizons: { "2030": 12, "2040": 18, "2050": 27 }, source: "DRIAS" },
      { code: "nuits_chaudes",  libelle: "Nuits chaudes (> 20 °C)",             unite: "nuits/an",      horizons: { "2030": 15, "2040": 24, "2050": 38 }, source: "DRIAS" },
      { code: "stress_hydrique",libelle: "Stress hydrique",                     unite: "indice (0-100)",horizons: { "2030": 30, "2040": 38, "2050": 48 }, source: "DRIAS-Eau" },
      { code: "biodiversite",   libelle: "Pression sur la biodiversité",        unite: "indice (0-100)",horizons: { "2030": 35, "2040": 44, "2050": 55 }, source: "INPN" },
    ],
  },
  "13055": {
    commune: { insee: "13055", nom: "Marseille", littoral: true },
    scenario: "RCP4.5",
    indicateurs: [
      { code: "canicule",       libelle: "Jours de forte chaleur (TX > 35 °C)", unite: "jours/an",      horizons: { "2030": 18, "2040": 26, "2050": 38 }, source: "DRIAS" },
      { code: "nuits_chaudes",  libelle: "Nuits chaudes (> 20 °C)",             unite: "nuits/an",      horizons: { "2030": 22, "2040": 33, "2050": 49 }, source: "DRIAS" },
      { code: "stress_hydrique",libelle: "Stress hydrique",                     unite: "indice (0-100)",horizons: { "2030": 45, "2040": 55, "2050": 67 }, source: "DRIAS-Eau" },
      { code: "biodiversite",   libelle: "Pression sur la biodiversité",        unite: "indice (0-100)",horizons: { "2030": 40, "2040": 50, "2050": 62 }, source: "INPN" },
    ],
  },
  "17300": {
    commune: { insee: "17300", nom: "La Rochelle", littoral: true },
    scenario: "RCP4.5",
    indicateurs: [
      { code: "canicule",       libelle: "Jours de forte chaleur (TX > 35 °C)", unite: "jours/an",      horizons: { "2030": 8,  "2040": 12, "2050": 18 }, source: "DRIAS" },
      { code: "nuits_chaudes",  libelle: "Nuits chaudes (> 20 °C)",             unite: "nuits/an",      horizons: { "2030": 10, "2040": 16, "2050": 25 }, source: "DRIAS" },
      { code: "stress_hydrique",libelle: "Stress hydrique",                     unite: "indice (0-100)",horizons: { "2030": 28, "2040": 35, "2050": 44 }, source: "DRIAS-Eau" },
      { code: "biodiversite",   libelle: "Pression sur la biodiversité",        unite: "indice (0-100)",horizons: { "2030": 33, "2040": 41, "2050": 51 }, source: "INPN" },
    ],
  },
  "33063": {
    commune: { insee: "33063", nom: "Bordeaux", littoral: false },
    scenario: "RCP4.5",
    indicateurs: [
      { code: "canicule",       libelle: "Jours de forte chaleur (TX > 35 °C)", unite: "jours/an",      horizons: { "2030": 14, "2040": 21, "2050": 31 }, source: "DRIAS" },
      { code: "nuits_chaudes",  libelle: "Nuits chaudes (> 20 °C)",             unite: "nuits/an",      horizons: { "2030": 16, "2040": 25, "2050": 39 }, source: "DRIAS" },
      { code: "stress_hydrique",libelle: "Stress hydrique",                     unite: "indice (0-100)",horizons: { "2030": 35, "2040": 44, "2050": 55 }, source: "DRIAS-Eau" },
      { code: "biodiversite",   libelle: "Pression sur la biodiversité",        unite: "indice (0-100)",horizons: { "2030": 37, "2040": 46, "2050": 57 }, source: "INPN" },
    ],
  },
  "97209": {
    commune: { insee: "97209", nom: "Fort-de-France", littoral: true },
    scenario: "RCP4.5",
    indicateurs: [
      { code: "canicule",       libelle: "Jours de forte chaleur (TX > 35 °C)", unite: "jours/an",      horizons: { "2030": 20, "2040": 28, "2050": 40 }, source: "DRIAS" },
      { code: "nuits_chaudes",  libelle: "Nuits chaudes (> 20 °C)",             unite: "nuits/an",      horizons: { "2030": 30, "2040": 42, "2050": 60 }, source: "DRIAS" },
      { code: "stress_hydrique",libelle: "Stress hydrique",                     unite: "indice (0-100)",horizons: { "2030": 38, "2040": 47, "2050": 58 }, source: "DRIAS-Eau" },
      { code: "biodiversite",   libelle: "Pression sur la biodiversité",        unite: "indice (0-100)",horizons: { "2030": 45, "2040": 56, "2050": 69 }, source: "INPN" },
    ],
  },
};

export function getMockSimulation(
  insee: string,
  vegetalisation: number,
  scenario: string
): Simulation {
  const data = MOCK_COMMUNE_DATA[insee];
  const canicule2050 = data?.indicateurs.find((i) => i.code === "canicule")?.horizons["2050"] ?? 20;
  const factor = vegetalisation / 100;
  const reduction = Math.round(canicule2050 * factor * 0.25);

  return {
    commune: insee,
    scenario,
    vegetalisation,
    reference: { canicule_2050: canicule2050 },
    simule: { canicule_2050: canicule2050 - reduction },
    delta: { canicule_2050: -reduction },
  };
}
