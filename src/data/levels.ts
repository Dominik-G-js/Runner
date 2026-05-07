export type GateOperator = '+' | 'x' | '-' | '/';

export interface GateOperation {
  operator: GateOperator;
  value: number;
}

export interface GatePairData {
  z: number;
  left: GateOperation;
  right: GateOperation;
}

export interface EnemyData {
  x: number;
  z: number;
  count: number;
}

export type ObstacleType = 'rotatingBar' | 'spikes' | 'movingBlock' | 'crusher';

export interface ObstacleData {
  type: ObstacleType;
  x: number;
  z: number;
  width?: number;
  damage: number;
}

export interface CollectibleLineData {
  z: number;
  xStart: number;
  xEnd: number;
  count: number;
}

export interface LevelData {
  id: number;
  startCount: number;
  length: number;
  gatePairs: GatePairData[];
  enemies: EnemyData[];
  obstacles: ObstacleData[];
  collectibles: CollectibleLineData[];
  starThresholds: [number, number, number];
}

const plus = (value: number): GateOperation => ({ operator: '+', value });
const times = (value: number): GateOperation => ({ operator: 'x', value });
const minus = (value: number): GateOperation => ({ operator: '-', value });
const divide = (value: number): GateOperation => ({ operator: '/', value });

export const levels: LevelData[] = [
  {
    id: 1,
    startCount: 12,
    length: 150,
    gatePairs: [
      { z: 24, left: plus(10), right: minus(5) },
      { z: 58, left: times(2), right: plus(25) },
      { z: 102, left: minus(10), right: times(3) },
    ],
    enemies: [{ x: 0, z: 82, count: 18 }],
    obstacles: [{ type: 'rotatingBar', x: -2.2, z: 122, damage: 4 }],
    collectibles: [
      { z: 40, xStart: -3.5, xEnd: 3.5, count: 7 },
      { z: 134, xStart: -2.5, xEnd: 2.5, count: 5 },
    ],
    starThresholds: [10, 30, 55],
  },
  {
    id: 2,
    startCount: 10,
    length: 170,
    gatePairs: [
      { z: 24, left: plus(25), right: divide(2) },
      { z: 66, left: times(2), right: minus(10) },
      { z: 116, left: plus(10), right: times(3) },
    ],
    enemies: [
      { x: -1.8, z: 92, count: 22 },
      { x: 2, z: 142, count: 35 },
    ],
    obstacles: [
      { type: 'spikes', x: 0, z: 48, width: 3.5, damage: 5 },
      { type: 'movingBlock', x: 0, z: 130, damage: 7 },
    ],
    collectibles: [{ z: 78, xStart: -4, xEnd: 4, count: 9 }],
    starThresholds: [12, 35, 70],
  },
  {
    id: 3,
    startCount: 14,
    length: 190,
    gatePairs: [
      { z: 30, left: times(2), right: plus(10) },
      { z: 82, left: divide(3), right: plus(25) },
      { z: 134, left: times(3), right: minus(5) },
    ],
    enemies: [
      { x: 0, z: 106, count: 42 },
      { x: -2, z: 162, count: 48 },
    ],
    obstacles: [
      { type: 'rotatingBar', x: 2, z: 58, damage: 6 },
      { type: 'crusher', x: -2, z: 148, damage: 9 },
    ],
    collectibles: [
      { z: 48, xStart: -3.5, xEnd: 1, count: 6 },
      { z: 176, xStart: -1, xEnd: 3.8, count: 7 },
    ],
    starThresholds: [15, 45, 95],
  },
  {
    id: 4,
    startCount: 16,
    length: 215,
    gatePairs: [
      { z: 28, left: plus(25), right: times(2) },
      { z: 86, left: minus(10), right: times(3) },
      { z: 150, left: plus(10), right: divide(2) },
    ],
    enemies: [
      { x: 2, z: 112, count: 55 },
      { x: -2, z: 184, count: 65 },
    ],
    obstacles: [
      { type: 'movingBlock', x: -1.5, z: 60, damage: 8 },
      { type: 'spikes', x: 2, z: 136, width: 3, damage: 8 },
      { type: 'rotatingBar', x: 0, z: 170, damage: 6 },
    ],
    collectibles: [
      { z: 42, xStart: -4, xEnd: 4, count: 8 },
      { z: 202, xStart: -3, xEnd: 3, count: 8 },
    ],
    starThresholds: [20, 55, 120],
  },
  {
    id: 5,
    startCount: 18,
    length: 235,
    gatePairs: [
      { z: 32, left: times(3), right: minus(5) },
      { z: 96, left: plus(25), right: divide(3) },
      { z: 160, left: times(2), right: plus(10) },
    ],
    enemies: [
      { x: -2, z: 72, count: 38 },
      { x: 2, z: 126, count: 70 },
      { x: 0, z: 200, count: 95 },
    ],
    obstacles: [
      { type: 'crusher', x: 2.4, z: 116, damage: 10 },
      { type: 'movingBlock', x: -1.5, z: 180, damage: 9 },
    ],
    collectibles: [
      { z: 54, xStart: -3.5, xEnd: 3.5, count: 8 },
      { z: 146, xStart: -4, xEnd: 0, count: 6 },
      { z: 220, xStart: 0, xEnd: 4, count: 7 },
    ],
    starThresholds: [25, 70, 150],
  },
  {
    id: 6,
    startCount: 20,
    length: 255,
    gatePairs: [
      { z: 34, left: plus(25), right: times(2) },
      { z: 102, left: divide(2), right: times(3) },
      { z: 174, left: minus(10), right: times(2) },
    ],
    enemies: [
      { x: 0, z: 82, count: 65 },
      { x: -2.2, z: 146, count: 85 },
      { x: 2, z: 220, count: 120 },
    ],
    obstacles: [
      { type: 'spikes', x: -2.5, z: 58, width: 3, damage: 9 },
      { type: 'rotatingBar', x: 2.4, z: 130, damage: 8 },
      { type: 'crusher', x: 0, z: 196, damage: 12 },
    ],
    collectibles: [
      { z: 118, xStart: -4, xEnd: 4, count: 10 },
      { z: 240, xStart: -4, xEnd: 4, count: 10 },
    ],
    starThresholds: [30, 85, 185],
  },
  {
    id: 7,
    startCount: 22,
    length: 280,
    gatePairs: [
      { z: 34, left: times(2), right: minus(10) },
      { z: 108, left: plus(25), right: divide(3) },
      { z: 184, left: times(3), right: plus(10) },
      { z: 236, left: divide(2), right: plus(25) },
    ],
    enemies: [
      { x: 2, z: 82, count: 74 },
      { x: -2, z: 154, count: 105 },
      { x: 0, z: 258, count: 135 },
    ],
    obstacles: [
      { type: 'movingBlock', x: 0, z: 58, damage: 9 },
      { type: 'spikes', x: 2.5, z: 134, width: 3.2, damage: 10 },
      { type: 'rotatingBar', x: -2.3, z: 214, damage: 9 },
    ],
    collectibles: [
      { z: 128, xStart: -4, xEnd: 4, count: 11 },
      { z: 270, xStart: -3, xEnd: 3, count: 8 },
    ],
    starThresholds: [35, 105, 230],
  },
  {
    id: 8,
    startCount: 24,
    length: 305,
    gatePairs: [
      { z: 36, left: plus(10), right: times(3) },
      { z: 110, left: divide(2), right: plus(25) },
      { z: 188, left: times(2), right: minus(5) },
      { z: 250, left: times(3), right: divide(3) },
    ],
    enemies: [
      { x: -2, z: 78, count: 90 },
      { x: 2, z: 158, count: 115 },
      { x: -1, z: 276, count: 165 },
    ],
    obstacles: [
      { type: 'crusher', x: -2.5, z: 136, damage: 12 },
      { type: 'movingBlock', x: 2.2, z: 220, damage: 10 },
      { type: 'spikes', x: 0, z: 238, width: 4, damage: 12 },
    ],
    collectibles: [
      { z: 58, xStart: -4, xEnd: 4, count: 10 },
      { z: 202, xStart: -4, xEnd: 4, count: 12 },
      { z: 292, xStart: -3, xEnd: 3, count: 8 },
    ],
    starThresholds: [40, 125, 280],
  },
  {
    id: 9,
    startCount: 26,
    length: 330,
    gatePairs: [
      { z: 38, left: times(2), right: plus(25) },
      { z: 112, left: minus(10), right: times(3) },
      { z: 196, left: divide(3), right: plus(25) },
      { z: 268, left: times(2), right: minus(5) },
    ],
    enemies: [
      { x: 0, z: 86, count: 100 },
      { x: -2, z: 172, count: 140 },
      { x: 2, z: 302, count: 190 },
    ],
    obstacles: [
      { type: 'rotatingBar', x: -2.5, z: 66, damage: 10 },
      { type: 'crusher', x: 2.4, z: 148, damage: 12 },
      { type: 'movingBlock', x: 0, z: 242, damage: 12 },
      { type: 'spikes', x: -2.5, z: 286, width: 3.2, damage: 14 },
    ],
    collectibles: [
      { z: 128, xStart: -4, xEnd: 4, count: 12 },
      { z: 224, xStart: -4, xEnd: 1, count: 10 },
      { z: 318, xStart: -3, xEnd: 3, count: 10 },
    ],
    starThresholds: [45, 145, 320],
  },
  {
    id: 10,
    startCount: 30,
    length: 360,
    gatePairs: [
      { z: 40, left: times(3), right: divide(2) },
      { z: 126, left: plus(25), right: minus(10) },
      { z: 212, left: times(2), right: plus(10) },
      { z: 290, left: divide(3), right: times(3) },
    ],
    enemies: [
      { x: -2, z: 94, count: 125 },
      { x: 2, z: 180, count: 165 },
      { x: 0, z: 328, count: 240 },
    ],
    obstacles: [
      { type: 'spikes', x: 2.4, z: 72, width: 3, damage: 12 },
      { type: 'rotatingBar', x: 0, z: 152, damage: 12 },
      { type: 'crusher', x: -2.5, z: 238, damage: 16 },
      { type: 'movingBlock', x: 2, z: 268, damage: 14 },
      { type: 'spikes', x: 0, z: 314, width: 4, damage: 16 },
    ],
    collectibles: [
      { z: 110, xStart: -4, xEnd: 4, count: 14 },
      { z: 198, xStart: -4, xEnd: 4, count: 14 },
      { z: 344, xStart: -4, xEnd: 4, count: 12 },
    ],
    starThresholds: [50, 175, 390],
  },
];

export function getLevel(levelId: number): LevelData {
  return levels[Math.max(0, Math.min(levels.length - 1, levelId - 1))];
}
