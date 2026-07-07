import type { Pin, PinLocation } from "../types/pin";
import { createId } from "../utils/id";

const STORAGE_KEY = "tomato-farm-maps.pins.v1";

/**
 * 過去の保存形式から現行形式(location + entries)へ変換する。
 * 世代1: {row,side,ns,comment,createdAt,updatedAt}
 * 世代2: {row,side,ns,entries}
 * 世代3(現行): {location:{...},entries}
 */
function migratePin(raw: unknown): Pin | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.location === "object" && obj.location !== null && Array.isArray(obj.entries)) {
    return obj as unknown as Pin;
  }

  if (typeof obj.row === "number" && (obj.side === "omote" || obj.side === "ura") && typeof obj.ns === "number") {
    const location: PinLocation = { kind: "bed", row: obj.row, side: obj.side, ns: obj.ns };
    const id = typeof obj.id === "string" ? obj.id : createId();

    if (Array.isArray(obj.entries)) {
      return { id, location, entries: obj.entries as Pin["entries"] };
    }

    if (typeof obj.comment === "string") {
      return {
        id,
        location,
        entries: [
          {
            id: createId(),
            category: "other",
            comment: obj.comment,
            createdAt: typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString(),
          },
        ],
      };
    }
  }

  return null;
}

function migratePins(parsed: unknown): Pin[] {
  if (!Array.isArray(parsed)) return [];
  return parsed.map(migratePin).filter((p): p is Pin => p !== null);
}

export function loadPins(): Pin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return migratePins(JSON.parse(raw));
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
  return migratePins(parsed);
}
