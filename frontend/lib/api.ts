import type { CommuneData, Simulation } from "./types";
import { DEMO_COMMUNES, MOCK_COMMUNE_DATA, getMockSimulation } from "./mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const USE_MOCK = !API_URL;

export async function searchCommunes(codePostal: string) {
  if (USE_MOCK) {
    await delay(300);
    return DEMO_COMMUNES.filter((c) => c.code_postal.startsWith(codePostal));
  }
  const res = await fetch(`${API_URL}/api/municipalities/search?code_postal=${codePostal}`);
  if (!res.ok) throw new Error("Recherche échouée");
  return res.json();
}

export async function getCommuneData(
  insee: string,
  scenario = "RCP4.5"
): Promise<CommuneData> {
  if (USE_MOCK) {
    await delay(400);
    const data = MOCK_COMMUNE_DATA[insee];
    if (!data) throw new Error(`Commune ${insee} inconnue`);
    return { ...data, scenario };
  }
  const res = await fetch(`${API_URL}/api/municipalities/${insee}?scenario=${scenario}`);
  if (!res.ok) throw new Error("Données introuvables");
  return res.json();
}

export async function getSimulation(
  insee: string,
  vegetalisation: number,
  scenario = "RCP4.5"
): Promise<Simulation> {
  if (USE_MOCK) {
    await delay(200);
    return getMockSimulation(insee, vegetalisation, scenario);
  }
  const res = await fetch(
    `${API_URL}/api/municipalities/${insee}/simulation?vegetalisation=${vegetalisation}&scenario=${scenario}`
  );
  if (!res.ok) throw new Error("Simulation échouée");
  return res.json();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
