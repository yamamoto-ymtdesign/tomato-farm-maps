import type { GreenhouseGeometry } from "./greenhouseConfig";
import type { Pin, PinDraft } from "../types/pin";

/** ピンのメートル座標(x, y)を求める */
export function pinToXY(geometry: GreenhouseGeometry, pin: Pin | PinDraft): { x: number; y: number } {
  const line = geometry.rows[pin.row - 1];
  const x = pin.side === "omote" ? line.xOmote : line.xUra;
  return { x, y: pin.ns };
}

/** 表示用のラベル: 「3列 表・北から12.3m」 */
export function formatPinLocation(pin: Pin | PinDraft): string {
  const sideLabel = pin.side === "omote" ? "表" : "裏";
  return `${pin.row}列 ${sideLabel}・北から${pin.ns.toFixed(1)}m`;
}
