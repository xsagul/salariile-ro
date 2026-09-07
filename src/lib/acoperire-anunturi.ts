import data from '@/data/acoperire-anunturi.json';
export type AcoperireAnunturi = {
  name: string; n: number; employers: number; counties: number;
  sourceCounts: Record<string, number>; gaps: string[]; status: string;
  explicitMonthly: number; assumedMonthly:number; midpointEstimate:number | null;
  medianBounds: { min: number; max: number } | null;
  observedRange: { min: number; max: number } | null;
  examples?: { url: string; source: string; min: number; max: number }[];
};
export const DATA_VERIFICARE_ANUNTURI = data.generatedAt;
export const PRAGURI_ANUNTURI = data.policy;
type SourceInventory = {inventoryUrls:number;catalogCandidates:number;catalogChecked:number;inventoryEnumerated:boolean;catalogPassComplete:boolean;pagesFetched:number;events:{error:string}[]};
export const INVENTAR_SURSE:Record<string,SourceInventory> = (data as unknown as {sourceInventory?:Record<string,SourceInventory>}).sourceInventory || {};
export const ACOPERIRE_ANUNTURI: Record<string, AcoperireAnunturi> = Object.assign(Object.create(null), data.coverage);
