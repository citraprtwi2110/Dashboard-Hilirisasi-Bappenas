export interface Criterion {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  description: string;
  descriptionEn: string;
  weight: number; // Computed priority weight (0..1)
  color: string;
  iconName?: string;
}

export interface Alternative {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  category: 'mineral' | 'agro' | 'energy' | 'custom';
  description: string;
  descriptionEn: string;
  keyCommodity: string;
  hilirisasiTarget: string;
  multiplierValue: string; // e.g. "11.5x"
  capexEstimate: string; // e.g. "US$ 1.8 Miliar"
  jobsEstimate: string; // e.g. "24.000 TK"
  trl: number; // Technology Readiness Level 1-9
  esgRisk: 'Rendah' | 'Sedang' | 'Tinggi' | 'Low' | 'Medium' | 'High';
  scores: Record<string, number>; // criterionId -> normalized score 0..1 or 1..9
  valueChain: {
    stage: 'Hulu' | 'Antara' | 'Hilir';
    stageEn: 'Upstream' | 'Midstream' | 'Downstream';
    products: string[];
    tech: string;
    valueAdd: string;
  }[];
}

export interface AhpMatrixState {
  size: number;
  matrix: number[][]; // size x size pairwise comparison values
}

export interface AhpCalculationResult {
  weights: number[]; // Priority vector (sums to 1)
  normalizedMatrix: number[][];
  columnSums: number[];
  lambdaMax: number;
  ci: number; // Consistency Index
  cr: number; // Consistency Ratio
  isConsistent: boolean;
  ri: number;
  inconsistencyHotspots?: {
    row: number;
    col: number;
    actual: number;
    ideal: number;
    deviation: number;
  }[];
}

export interface AlternativeScoreResult {
  alternativeId: string;
  compositeScore: number;
  rank: number;
  criteriaContributions: Record<string, number>; // criterionId -> weight * score
  percentageShare: number;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  titleEn: string;
  sectorBadge: string;
  description: string;
  descriptionEn: string;
  criteria: Criterion[];
  initialMatrix: number[][];
  alternatives: Alternative[];
  policySummary: string;
  policySummaryEn: string;
}
