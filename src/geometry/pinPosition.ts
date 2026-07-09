import type { GreenhouseGeometry } from "./greenhouseConfig";
import type { PinLocation, RowExtent } from "../types/pin";

const SAME_LOCATION_THRESHOLD_M = 1.5;

/** 列のうち指定範囲(全体/北半分/南半分)のY座標範囲 */
export function rowExtentRange(
  geometry: GreenhouseGeometry,
  extent: RowExtent,
): { y0: number; y1: number } {
  if (extent === "north") return { y0: geometry.bedTop, y1: geometry.channelY };
  if (extent === "south") return { y0: geometry.channelY, y1: geometry.bedBottom };
  return { y0: geometry.bedTop, y1: geometry.bedBottom };
}

/** 位置情報のメートル座標(x, y)を求める */
export function locationToXY(geometry: GreenhouseGeometry, location: PinLocation): { x: number; y: number } {
  if (location.kind === "office") {
    return { x: location.x, y: location.y };
  }
  const line = geometry.rows[location.row - 1];
  if (location.kind === "row") {
    const { y0, y1 } = rowExtentRange(geometry, location.extent);
    return { x: line.xCenter, y: (y0 + y1) / 2 };
  }
  const x = location.side === "omote" ? line.xOmote : line.xUra;
  return { x, y: location.ns };
}

const EXTENT_LABEL: Record<RowExtent, string> = {
  full: "全体",
  north: "北半分",
  south: "南半分",
};

/** 表示用のラベル: 「3列 表・北から12m」「5列 北半分」または「事務所」 */
export function formatPinLocation(location: PinLocation): string {
  if (location.kind === "office") {
    return "事務所";
  }
  if (location.kind === "row") {
    return `${location.row}列 ${EXTENT_LABEL[location.extent]}`;
  }
  const sideLabel = location.side === "omote" ? "表" : "裏";
  return `${location.row}列 ${sideLabel}・北から${Math.round(location.ns)}m`;
}

/** 2つの位置が「ほぼ同じ場所」とみなせるか */
export function isSameLocation(a: PinLocation, b: PinLocation): boolean {
  if (a.kind === "bed" && b.kind === "bed") {
    return a.row === b.row && a.side === b.side && Math.abs(a.ns - b.ns) <= SAME_LOCATION_THRESHOLD_M;
  }
  if (a.kind === "row" && b.kind === "row") {
    return a.row === b.row && a.extent === b.extent;
  }
  if (a.kind === "office" && b.kind === "office") {
    return Math.hypot(a.x - b.x, a.y - b.y) <= SAME_LOCATION_THRESHOLD_M;
  }
  return false;
}
