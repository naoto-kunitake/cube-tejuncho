import { cellCenter, cellPosition, FIGURE_LAYOUT } from './layout';

export type Arrow = readonly [number, number];

const { cell } = FIGURE_LAYOUT;
// 端点をタイルの内側に寄せる量、中心基準の矢印の先端の越え、3巡の平行移動 (ノートの矢印の規則)
const INSET = 0.1 * cell;
const TIP_EXTENSION = 0.2 * cell;
const CYCLE_SHIFT = 0.25 * cell;
const EDGE_CYCLE_SHIFT = 0.15 * cell;
const EDGE_CYCLE_TAIL = 0.25 * cell;
// 軸の半幅、矢じりの長さ、矢じりの半幅 (参考図の比率)
const SHAFT_HALF_WIDTH = 0.7;
const HEAD_LENGTH = 5.4;
const HEAD_HALF_WIDTH = 2.7;

const LOW = cellPosition(0) + INSET;
const HIGH = cellPosition(2) + cell - INSET;

function columnOf(index: number): number {
  return index % 3;
}

function rowOf(index: number): number {
  return Math.floor(index / 3);
}

function centerX(index: number): number {
  return cellCenter(columnOf(index));
}

function centerY(index: number): number {
  return cellCenter(rowOf(index));
}

function isEdge(index: number): boolean {
  return index % 2 === 1;
}

type Point = readonly [number, number];

// 端点はタイルの「外側」。辺タイルは外側の辺の真ん中。角タイルは2点入れ替えの縦横だけ外側の辺の真ん中、斜めと3巡は中心
function anchor(index: number, ux: number, uy: number, isCycle: boolean): Point {
  const x = centerX(index);
  const y = centerY(index);
  if (isEdge(index)) {
    if (index === 1) {
      return [x, LOW];
    }
    if (index === 7) {
      return [x, HIGH];
    }
    return index === 3 ? [LOW, y] : [HIGH, y];
  }
  const isHorizontal = Math.abs(uy) < 0.3;
  const isVertical = Math.abs(ux) < 0.3;
  if (isCycle || (!isHorizontal && !isVertical)) {
    return [x, y];
  }
  if (isHorizontal) {
    return [columnOf(index) === 0 ? LOW : HIGH, y];
  }
  return [x, rowOf(index) === 0 ? LOW : HIGH];
}

// 軸と矢じりを1つの多角形にする (継ぎ目や線端のはみ出しをなくす)
function arrowPath(x1: number, y1: number, x2: number, y2: number, isTwoWay: boolean): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const w = SHAFT_HALF_WIDTH;
  const hl = HEAD_LENGTH;
  const hw = HEAD_HALF_WIDTH;
  const sx = isTwoWay ? x1 + ux * hl : x1;
  const sy = isTwoWay ? y1 + uy * hl : y1;
  const ex = x2 - ux * hl;
  const ey = y2 - uy * hl;
  const points: string[] = [];
  const push = (x: number, y: number) => {
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  };
  if (isTwoWay) {
    push(x1, y1);
    push(sx + px * hw, sy + py * hw);
    push(sx + px * w, sy + py * w);
  } else {
    push(x1 + px * w, y1 + py * w);
  }
  push(ex + px * w, ey + py * w);
  push(ex + px * hw, ey + py * hw);
  push(x2, y2);
  push(ex - px * hw, ey - py * hw);
  push(ex - px * w, ey - py * w);
  if (isTwoWay) {
    push(sx - px * w, sy - py * w);
    push(sx - px * hw, sy - py * hw);
  } else {
    push(x1 - px * w, y1 - py * w);
  }
  return `M${points.join(' L')} Z`;
}

type CycleAdjustment = { offset: number; tail: number };

// 3巡の矢印が同じタイルで先端をぶつけないための補正。辺の3巡 (U perm) は尾を内側から始め、
// 中心を通る直線だけ重心から離す。角の3巡 (A perm、G permの角) は重心から外側へ離して先端を散らす
function cycleAdjustment(isFromEdge: boolean, dx: number, dy: number, side: number): CycleAdjustment {
  const direction = side > 0 ? -1 : 1;
  if (isFromEdge) {
    const isStraight = Math.abs(dx) < 1 || Math.abs(dy) < 1;
    const offset = isStraight && Math.abs(side) >= EDGE_CYCLE_SHIFT ? direction * EDGE_CYCLE_SHIFT : 0;
    return { offset, tail: EDGE_CYCLE_TAIL };
  }
  const offset = Math.abs(side) >= EDGE_CYCLE_SHIFT ? direction * CYCLE_SHIFT : 0;
  return { offset, tail: 0 };
}

function connectedComponent(start: number, adjacency: Map<number, Set<number>>): number[] {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.pop() ?? start;
    for (const next of adjacency.get(current) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return [...seen];
}

function buildAdjacency(arrows: readonly Arrow[]): Map<number, Set<number>> {
  const adjacency = new Map<number, Set<number>>();
  const link = (from: number, to: number) => {
    const set = adjacency.get(from) ?? new Set<number>();
    set.add(to);
    adjacency.set(from, set);
  };
  for (const [from, to] of arrows) {
    link(from, to);
    link(to, from);
  }
  return adjacency;
}

// 入れ替えの矢印のpath (SVGのd属性)。両向きの入れ替えは1本にまとめて両端に矢じりを付ける
export function arrowPaths(arrows: readonly Arrow[]): string[] {
  const adjacency = buildAdjacency(arrows);
  const drawn = new Set<string>();
  const paths: string[] = [];
  for (const [from, to] of arrows) {
    const key = [from, to].sort((a, b) => a - b).join('-');
    const isTwoWay = arrows.some(([a, b]) => a === to && b === from);
    if (isTwoWay && drawn.has(key)) {
      continue;
    }
    drawn.add(key);
    const component = connectedComponent(from, adjacency);
    const isCycle = component.length >= 3 && !isTwoWay;
    const gx = component.reduce((sum, index) => sum + centerX(index), 0) / component.length;
    const gy = component.reduce((sum, index) => sum + centerY(index), 0) / component.length;
    const dx0 = centerX(to) - centerX(from);
    const dy0 = centerY(to) - centerY(from);
    const length0 = Math.hypot(dx0, dy0);
    const ux0 = dx0 / length0;
    const uy0 = dy0 / length0;
    let [ax, ay] = anchor(from, ux0, uy0, isCycle);
    let [bx, by] = anchor(to, ux0, uy0, isCycle);
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy);
    const ux = dx / length;
    const uy = dy / length;
    const nx = -uy;
    const ny = ux;
    // 巡回の重心が線のどちら側にあるか。線上にないときだけ外側へ逃がす
    const side = (gx - ax) * nx + (gy - ay) * ny;
    const isCentered = !isEdge(from) && ax === centerX(from) && ay === centerY(from);
    const tip = isCentered ? TIP_EXTENSION : 0;
    const { offset, tail } = isCycle ? cycleAdjustment(isEdge(from), dx, dy, side) : { offset: 0, tail: 0 };
    ax += nx * offset;
    ay += ny * offset;
    bx += nx * offset;
    by += ny * offset;
    const startShift = isTwoWay ? -tip : tail;
    paths.push(arrowPath(ax + ux * startShift, ay + uy * startShift, bx + ux * tip, by + uy * tip, isTwoWay));
  }
  return paths;
}
