import type { Pin } from "../types/pin";
import { createId } from "../utils/id";

const STORAGE_KEY = "tomato-farm-maps.pins.v1";

/** 旧形式(entriesを持たず、comment/createdAtを直接持つ)のピンを新形式に変換する */
function migratePin(raw: unknown): Pin | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.row !== "number" || (obj.side !== "omote" && obj.side !== "ura")) return null;
  if (typeof obj.ns !== "number") return null;

  if (Array.isArray(obj.entries)) {
    return obj as unknown as Pin;
  }

  if (typeof obj.comment === "string") {
    return {
      id: typeof obj.id === "string" ? obj.id : createId(),
      row: obj.row,
      side: obj.side,
      ns: obj.ns,
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
