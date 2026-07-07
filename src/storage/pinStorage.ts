import type { Pin } from "../types/pin";

const STORAGE_KEY = "tomato-farm-maps.pins.v1";

export function loadPins(): Pin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function savePins(pins: Pin[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
}

export function exportPinsAsJson(pins: Pin[]): string {
  return JSON.stringify(pins, null, 2);
}

export function parsePinsFromJson(json: string): Pin[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error("不正なファイル形式です");
  }
  return parsed;
}
