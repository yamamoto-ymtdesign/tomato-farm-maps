import type { GreenhouseGeometry } from "./greenhouseConfig";
import type { PinLocation } from "../types/pin";

const SAME_LOCATION_THRESHOLD_M = 1.5;

/** 位置情報のメートル座標(x, y)を求める */
export function locationToXY(geometry: GreenhouseGeometry, location: PinLocation): { x: number; y: number } {
  if (location.kind === "office") {
    return { x: location.x, y: location.y };
  }
  const line = geometry.rows[location.row - 1];
  const x = location.side === "omote" ? line.xOmote : line.xUra;
  return { x, y: location.ns };
}

/** 表示用のラベル: 「3列 表・北から12m」または「事務所」 */
export function formatPinLocation(location: PinLocation): string {
  if (location.kind === "office") {
    return "事務所";
  }
  const sideLabel = location.side === "omote" ? "表" : "裏";
  return `${location.row}列 ${sideLabel}・北から${Math.round(location.ns)}m`;
}

/** 2つの位置が「ほぼ同じ場所」とみなせるか */
export function isSameLocation(a: PinLocation, b: PinLocation): boolean {
  if (a.kind === "bed" && b.kind === "bed") {
    return a.row === b.row && a.side === b.side && Math.abs(a.ns - b.ns) <= SAME_LOCATION_THRESHOLD_M;
  }
  if (a.kind === "office" && b.kind === "office") {
    return Math.hypot(a.x - b.x, a.y - b.y) <= SAME_LOCATION_THRESHOLD_M;
  }
  return false;
}
