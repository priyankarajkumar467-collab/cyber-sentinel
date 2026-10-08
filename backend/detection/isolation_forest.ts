import { BehavioralFeatures } from '../feature_engineering/features';

export interface AnomalyDetectionResult {
  is_anomalous: boolean;
  anomaly_score: number; // 0.0 to 1.0 (where >= 0.6 is anomalous)
  confidence: number;
  average_path_length: number;
  deviating_dimensions: string[];
}

interface TreeNode {
  splitFeature?: number;
  splitValue?: number;
  size: number;
  left?: TreeNode;
  right?: TreeNode;
}

// Average path length formula c(n) from Liu et al. (2008)
function c(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  const eulerMascheroni = 0.5772156649;
  return 2.0 * (Math.log(n - 1) + eulerMascheroni) - (2.0 * (n - 1) / n);
}

export class IsolationForest {
  private trees: TreeNode[] = [];
  private numTrees: number;
  private subSampleSize: number;
  private maxDepth: number;
  private featureNames = [
    'dest_port_diversity',
    'conn_rate_per_sec',
    'failed_login_count',
    'outbound_mb',
    'egress_ratio',
  ];

  constructor(numTrees = 50, subSampleSize = 128) {
    this.numTrees = numTrees;
    this.subSampleSize = subSampleSize;
    this.maxDepth = Math.ceil(Math.log2(subSampleSize));
    this.trainBaseline();
  }

  // Feature vector extraction: [diversity, rate, failed_logins, outbound_mb, egress_ratio]
  private vectorize(f: BehavioralFeatures): number[] {
    return [
      f.dest_port_diversity,
      f.conn_rate_per_sec,
      f.failed_login_count,
      f.outbound_mb,
      f.egress_ratio,
    ];
  }

  // Generate synthetic baseline representing standard benign enterprise traffic
  private trainBaseline() {
    const trainingData: number[][] = [];
    for (let i = 0; i < 256; i++) {
      // Normal traffic: low port diversity (1-2), moderate rate (1-5/s), 0 failed logins, low outbound (0.05-15MB)
      const diversity = 1 + (Math.random() < 0.1 ? 1 : 0);
      const rate = 0.5 + Math.random() * 4.5;
      const failed = Math.random() < 0.03 ? 1 : 0;
      const outboundMb = 0.1 + Math.random() * 8.0;
      const egressRatio = 0.2 + Math.random() * 0.4;
      trainingData.push([diversity, rate, failed, outboundMb, egressRatio]);
    }

    this.trees = [];
    for (let t = 0; t < this.numTrees; t++) {
      // Sample subset
      const sample: number[][] = [];
      for (let s = 0; s < this.subSampleSize; s++) {
        const randIdx = Math.floor(Math.random() * trainingData.length);
        sample.push([...trainingData[randIdx]]);
      }
      this.trees.push(this.buildTree(sample, 0, this.maxDepth));
    }
  }

  private buildTree(data: number[][], currentDepth: number, maxDepth: number): TreeNode {
    if (currentDepth >= maxDepth || data.length <= 1) {
      return { size: data.length };
    }

    const numFeatures = this.featureNames.length;
    const featureIdx = Math.floor(Math.random() * numFeatures);

    let min = Infinity;
    let max = -Infinity;
    for (const row of data) {
      const v = row[featureIdx];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    if (min === max) {
      return { size: data.length };
    }

    const splitVal = min + Math.random() * (max - min);
    const leftData = data.filter((row) => row[featureIdx] < splitVal);
    const rightData = data.filter((row) => row[featureIdx] >= splitVal);

    if (leftData.length === 0 || rightData.length === 0) {
      return { size: data.length };
    }

    return {
      size: data.length,
      splitFeature: featureIdx,
      splitValue: splitVal,
      left: this.buildTree(leftData, currentDepth + 1, maxDepth),
      right: this.buildTree(rightData, currentDepth + 1, maxDepth),
    };
  }

  private pathLength(x: number[], node: TreeNode, currentDepth: number): number {
    if (!node.left || !node.right || node.splitFeature === undefined || node.splitValue === undefined) {
      return currentDepth + c(node.size);
    }

    if (x[node.splitFeature] < node.splitValue) {
      return this.pathLength(x, node.left, currentDepth + 1);
    } else {
      return this.pathLength(x, node.right, currentDepth + 1);
    }
  }

  public predict(features: BehavioralFeatures): AnomalyDetectionResult {
    const x = this.vectorize(features);
    let totalPathLength = 0;

    for (const tree of this.trees) {
      totalPathLength += this.pathLength(x, tree, 0);
    }

    const avgPathLength = totalPathLength / this.trees.length;
    const cN = c(this.subSampleSize);

    // Anomaly score s = 2 ^ (-E(h) / c(n))
    let anomalyScore = Math.pow(2, -avgPathLength / (cN || 1));
    anomalyScore = Math.min(1.0, Math.max(0.0, parseFloat(anomalyScore.toFixed(3))));

    // Identify features that deviate the most from standard baselines
    const deviating: string[] = [];
    if (features.dest_port_diversity > 5) deviating.push('Destination Port Diversity');
    if (features.conn_rate_per_sec > 15) deviating.push('Connection Velocity');
    if (features.failed_login_count > 5) deviating.push('Authentication Failures');
    if (features.outbound_mb > 50) deviating.push('Outbound Egress Volume');
    if (features.egress_ratio > 0.85) deviating.push('Asymmetric Egress Ratio');

    const isAnomalous = anomalyScore >= 0.6 || deviating.length > 0;

    return {
      is_anomalous: isAnomalous,
      anomaly_score: anomalyScore,
      confidence: parseFloat((0.85 + Math.min(0.14, Math.abs(anomalyScore - 0.5) * 0.3)).toFixed(2)),
      average_path_length: parseFloat(avgPathLength.toFixed(2)),
      deviating_dimensions: deviating,
    };
  }
}

export const defaultIsolationForest = new IsolationForest();
