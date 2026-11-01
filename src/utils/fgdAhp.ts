import { FGD_META, NA_CRIT, NB_ALTS, NC_INST } from '../data/fgdMetadata';

export const RI_TABLE: Record<number, number> = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

export interface AhpEvaluation {
  w: number[];
  cr: number;
  lambdaMax?: number;
  ci?: number;
}

export interface RespondentEntry {
  id: string;
  fgd: string; // e.g. "F1", "F4"
  kelompok: string;
  institusi: string;
  jabatan: string;
  src: 'form' | 'excel' | 'contoh';
  A: (number | null)[]; // 10 pairs for 5 criteria
  B: (number | null)[]; // 15 pairs (5 criteria * 3 pairs of alternatives)
  C: (number | null)[]; // 10 pairs for 5 policy instruments
  D: string[]; // 4 qualitative questions
  ts: number;
}

export interface EntryEvaluationResult {
  A: AhpEvaluation | null;
  B: AhpEvaluation[] | null;
  C: AhpEvaluation | null;
  crB: number | null;
  ok: boolean;
}

export interface AggregatedCommodityResult {
  nA: number;
  nB: number;
  nC: number;
  A: AhpEvaluation | null;
  B: AhpEvaluation[] | null;
  C: AhpEvaluation | null;
  crB: number | null;
  alt: { total: number; parts: number[] }[] | null;
}

export function generatePairs(n: number): [number, number][] {
  const p: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      p.push([i, j]);
    }
  }
  return p;
}

/**
 * Saaty Geometric Mean AHP calculation
 */
export function calculateFgdAhp(vals: number[], n: number): AhpEvaluation {
  const p = generatePairs(n);
  const M: number[][] = Array.from({ length: n }, () => Array(n).fill(1));

  p.forEach(([i, j], k) => {
    const v = vals[k] ?? 1;
    M[i][j] = v;
    M[j][i] = 1 / v;
  });

  // Geometric mean of each row
  const gm = M.map((row) => Math.pow(row.reduce((acc, val) => acc * val, 1), 1 / n));
  const sumGm = gm.reduce((acc, val) => acc + val, 0);
  const w = gm.map((g) => (sumGm > 0 ? g / sumGm : 1 / n));

  // Principal eigenvalue
  let lambdaSum = 0;
  for (let i = 0; i < n; i++) {
    let rowTimesW = 0;
    for (let j = 0; j < n; j++) {
      rowTimesW += M[i][j] * w[j];
    }
    lambdaSum += w[i] > 0 ? rowTimesW / w[i] : 0;
  }
  const lambdaMax = lambdaSum / n;
  const ri = RI_TABLE[n] || 1.12;
  const ci = n > 2 ? (lambdaMax - n) / (n - 1) : 0;
  const cr = n > 2 ? Math.max(0, ci / ri) : 0;

  return { w, cr, lambdaMax, ci };
}

export function isCompleteArray(arr: (number | null)[] | undefined, len: number): arr is number[] {
  return Array.isArray(arr) && arr.length === len && arr.every((v) => typeof v === 'number' && v > 0);
}

export function evaluateEntry(entry: RespondentEntry): EntryEvaluationResult {
  const res: EntryEvaluationResult = { A: null, B: null, C: null, crB: null, ok: false };

  if (isCompleteArray(entry.A, NA_CRIT)) {
    res.A = calculateFgdAhp(entry.A, 5);
  }

  if (isCompleteArray(entry.B, NB_ALTS)) {
    res.B = [0, 1, 2, 3, 4].map((c) =>
      calculateFgdAhp(entry.B.slice(c * 3, c * 3 + 3) as number[], 3)
    );
    res.crB = Math.max(...res.B.map((x) => x.cr));
  }

  if (isCompleteArray(entry.C, NC_INST)) {
    res.C = calculateFgdAhp(entry.C, 5);
  }

  res.ok =
    (!res.A || res.A.cr <= 0.1001) &&
    (res.crB === null || res.crB <= 0.1001) &&
    (!res.C || res.C.cr <= 0.1001);

  return res;
}

/**
 * Geometric aggregation across respondents
 */
export function aggregateEntries(list: RespondentEntry[]): AggregatedCommodityResult {
  const geoAgg = (key: 'A' | 'B' | 'C', len: number): number[] | null => {
    const validRows = list
      .filter((e) => isCompleteArray(e[key], len))
      .map((e) => e[key] as number[]);
    if (validRows.length === 0) return null;

    return Array.from({ length: len }, (_, k) =>
      Math.exp(validRows.reduce((sum, r) => sum + Math.log(r[k]), 0) / validRows.length)
    );
  };

  const aggA = geoAgg('A', NA_CRIT);
  const aggB = geoAgg('B', NB_ALTS);
  const aggC = geoAgg('C', NC_INST);

  const out: AggregatedCommodityResult = {
    nA: list.filter((e) => isCompleteArray(e.A, NA_CRIT)).length,
    nB: list.filter((e) => isCompleteArray(e.B, NB_ALTS)).length,
    nC: list.filter((e) => isCompleteArray(e.C, NC_INST)).length,
    A: aggA ? calculateFgdAhp(aggA, 5) : null,
    B: aggB ? [0, 1, 2, 3, 4].map((c) => calculateFgdAhp(aggB.slice(c * 3, c * 3 + 3), 3)) : null,
    C: aggC ? calculateFgdAhp(aggC, 5) : null,
    crB: null,
    alt: null,
  };

  if (out.B) {
    out.crB = Math.max(...out.B.map((x) => x.cr));
  }

  if (out.A && out.B) {
    out.alt = [0, 1, 2].map((a) => {
      const parts = out.B!.map((b, c) => out.A!.w[c] * b.w[a]);
      const total = parts.reduce((s, p) => s + p, 0);
      return { total, parts };
    });
  }

  return out;
}

export function findWorstInconsistentPair(vals: number[], n: number): number {
  const { w, cr } = calculateFgdAhp(vals, n);
  if (cr <= 0.1001) return -1;

  let worstIndex = -1;
  let maxDev = -1;
  const p = generatePairs(n);

  p.forEach(([i, j], k) => {
    const actual = vals[k] ?? 1;
    const ideal = w[j] > 0 ? w[i] / w[j] : 1;
    const dev = Math.abs(Math.log(actual / ideal));
    if (dev > maxDev) {
      maxDev = dev;
      worstIndex = k;
    }
  });

  return worstIndex;
}

export const argmax = (arr: number[]): number => {
  return arr.reduce((bestIdx, val, idx) => (val > arr[bestIdx] ? idx : bestIdx), 0);
};

export const formatPercent = (x: number | null | undefined): string => {
  if (x == null || isNaN(x)) return '–';
  return (x * 100).toFixed(1).replace('.', ',') + '%';
};

export const formatDecimal = (x: number | null | undefined, digits: number = 2): string => {
  if (x == null || isNaN(x)) return '–';
  return x.toFixed(digits).replace('.', ',');
};
