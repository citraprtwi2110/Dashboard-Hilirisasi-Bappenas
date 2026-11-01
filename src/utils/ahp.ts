import { AhpCalculationResult, Alternative, AlternativeScoreResult, Criterion } from '../types/ahp';

// Saaty Random Index (RI) table for matrix sizes 1..15
export const SAATY_RI: Record<number, number> = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.54,
  13: 1.56,
  14: 1.57,
  15: 1.59,
};

export interface SaatyScaleLevel {
  value: number;
  labelId: string;
  labelEn: string;
  explanationId: string;
  explanationEn: string;
}

export const SAATY_SCALE: SaatyScaleLevel[] = [
  { value: 1, labelId: 'Sama Penting (1)', labelEn: 'Equally Important (1)', explanationId: 'Kedua elemen memiliki pengaruh yang sama besar', explanationEn: 'Both elements contribute equally to the objective' },
  { value: 2, labelId: 'Mendekati Sedikit Lebih Penting (2)', labelEn: 'Weak / Intermediate (2)', explanationId: 'Nilai antara dua pertimbangan yang berdekatan', explanationEn: 'Intermediate value between equal and moderate' },
  { value: 3, labelId: 'Sedikit Lebih Penting (3)', labelEn: 'Moderately Important (3)', explanationId: 'Pengalaman & penilaian sedikit memihak satu elemen', explanationEn: 'Experience and judgment slightly favor one element' },
  { value: 4, labelId: 'Mendekati Lebih Penting (4)', labelEn: 'Moderate plus (4)', explanationId: 'Nilai kompromi antara sedikit dan lebih penting', explanationEn: 'Intermediate value between moderate and strong' },
  { value: 5, labelId: 'Lebih Penting / Kuat (5)', labelEn: 'Strongly Important (5)', explanationId: 'Penilaian sangat memihak satu elemen atas yang lain', explanationEn: 'Judgment strongly favors one element over another' },
  { value: 6, labelId: 'Mendekati Sangat Penting (6)', labelEn: 'Strong plus (6)', explanationId: 'Nilai kompromi antara kuat dan sangat penting', explanationEn: 'Intermediate value between strong and very strong' },
  { value: 7, labelId: 'Sangat Penting / Dominan (7)', labelEn: 'Very Strongly Important (7)', explanationId: 'Satu elemen sangat dominan dan terbukti signifikan', explanationEn: 'One element is strongly favored and its dominance is demonstrated' },
  { value: 8, labelId: 'Mendekati Mutlak (8)', labelEn: 'Very strong plus (8)', explanationId: 'Nilai kompromi antara sangat penting dan mutlak', explanationEn: 'Intermediate value between very strong and extreme' },
  { value: 9, labelId: 'Mutlak Lebih Penting (9)', labelEn: 'Extremely Important (9)', explanationId: 'Tingkat penegasan tertinggi yang dapat diberikan', explanationEn: 'Evidence favoring one element over another is of the highest affirmation' },
];

/**
 * Calculates priority weights and consistency ratio for a pairwise comparison matrix
 */
export function calculateAhpWeights(matrix: number[][]): AhpCalculationResult {
  const n = matrix.length;
  if (n === 0) {
    return {
      weights: [],
      normalizedMatrix: [],
      columnSums: [],
      lambdaMax: 0,
      ci: 0,
      cr: 0,
      isConsistent: true,
      ri: 0,
    };
  }

  // 1. Column sums
  const columnSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      columnSums[j] += matrix[i][j];
    }
  }

  // 2. Normalized matrix
  const normalizedMatrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    normalizedMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      normalizedMatrix[i][j] = columnSums[j] > 0 ? matrix[i][j] / columnSums[j] : 0;
    }
  }

  // 3. Priority weights (Row averages of normalized matrix)
  const weights = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += normalizedMatrix[i][j];
    }
    weights[i] = rowSum / n;
  }

  // 4. Principal Eigenvalue (lambdaMax)
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    let weightedSum = 0;
    for (let j = 0; j < n; j++) {
      weightedSum += matrix[i][j] * weights[j];
    }
    if (weights[i] > 0) {
      lambdaMax += weightedSum / weights[i];
    }
  }
  lambdaMax = lambdaMax / n;

  // 5. Consistency Index (CI) & Consistency Ratio (CR)
  const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
  const ri = SAATY_RI[n] ?? (1.98 * (n - 2)) / n;
  const rawCr = ri > 0 ? ci / ri : 0;
  // Ensure non-negative due to float rounding
  const cr = Math.max(0, rawCr);
  const isConsistent = cr <= 0.1001;

  // 6. Find inconsistency hotspots (which cell causes highest distortion)
  const hotspots: { row: number; col: number; actual: number; ideal: number; deviation: number }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const actual = matrix[i][j];
      const ideal = weights[j] > 0 ? weights[i] / weights[j] : 1;
      const deviation = Math.abs(Math.log(actual / ideal));
      if (deviation > 0.4) {
        hotspots.push({ row: i, col: j, actual, ideal, deviation });
      }
    }
  }
  hotspots.sort((a, b) => b.deviation - a.deviation);

  return {
    weights,
    normalizedMatrix,
    columnSums,
    lambdaMax,
    ci,
    cr,
    isConsistent,
    ri,
    inconsistencyHotspots: hotspots.slice(0, 3),
  };
}

/**
 * Calculates composite ranking of alternatives based on criteria weights and scores
 */
export function calculateCompositeScores(
  alternatives: Alternative[],
  criteria: Criterion[],
  customWeights?: number[]
): AlternativeScoreResult[] {
  const weights = customWeights ?? criteria.map((c) => c.weight);

  const results: AlternativeScoreResult[] = alternatives.map((alt) => {
    let totalScore = 0;
    const criteriaContributions: Record<string, number> = {};

    criteria.forEach((crit, index) => {
      const weight = weights[index] ?? 0;
      const score = alt.scores[crit.id] ?? 0;
      const contribution = weight * score;
      criteriaContributions[crit.id] = contribution;
      totalScore += contribution;
    });

    return {
      alternativeId: alt.id,
      compositeScore: totalScore,
      rank: 1, // temporary
      criteriaContributions,
      percentageShare: 0,
    };
  });

  // Calculate percentage shares
  const sumScores = results.reduce((acc, r) => acc + r.compositeScore, 0);
  results.forEach((r) => {
    r.percentageShare = sumScores > 0 ? (r.compositeScore / sumScores) * 100 : 0;
  });

  // Sort descending and assign ranks
  results.sort((a, b) => b.compositeScore - a.compositeScore);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return results;
}

/**
 * Rebalances other criteria weights when one criterion's weight is adjusted in sensitivity analysis
 */
export function rebalanceWeightsForSensitivity(
  originalWeights: number[],
  targetIndex: number,
  newWeight: number
): number[] {
  const n = originalWeights.length;
  const clampedWeight = Math.max(0, Math.min(1, newWeight));
  const newWeights = [...originalWeights];
  newWeights[targetIndex] = clampedWeight;

  const remainingWeight = 1 - clampedWeight;
  const currentOtherSum = originalWeights.reduce((sum, w, idx) => (idx === targetIndex ? sum : sum + w), 0);

  for (let i = 0; i < n; i++) {
    if (i !== targetIndex) {
      if (currentOtherSum > 0.0001) {
        newWeights[i] = (originalWeights[i] / currentOtherSum) * remainingWeight;
      } else {
        newWeights[i] = remainingWeight / (n - 1);
      }
    }
  }

  return newWeights;
}

/**
 * Formats fractional pairwise comparison values into readable strings (e.g. 1/3, 1/5, 4)
 */
export function formatFraction(val: number): string {
  if (Math.abs(val - 1) < 0.001) return '1';
  if (val > 1) {
    return Math.round(val).toString();
  }
  const reciprocal = Math.round(1 / val);
  return `1/${reciprocal}`;
}

/**
 * Auto-corrects the single most inconsistent cell in a matrix to guide the user towards CR <= 0.10
 */
export function autoTuneMatrixForConsistency(matrix: number[][]): number[][] {
  const result = calculateAhpWeights(matrix);
  if (result.isConsistent || !result.inconsistencyHotspots || result.inconsistencyHotspots.length === 0) {
    return matrix;
  }

  const newMatrix = matrix.map((row) => [...row]);
  const hotspot = result.inconsistencyHotspots[0];
  const roundedIdeal = Math.max(1 / 9, Math.min(9, Math.round(hotspot.ideal * 2) / 2));
  
  // Snap to Saaty integers or reciprocal of integers
  let snapped = roundedIdeal >= 1 ? Math.round(roundedIdeal) : 1 / Math.round(1 / roundedIdeal);
  if (snapped === 0) snapped = 1;

  newMatrix[hotspot.row][hotspot.col] = snapped;
  newMatrix[hotspot.col][hotspot.row] = 1 / snapped;

  return newMatrix;
}
