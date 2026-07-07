import type { Side } from "../geometry/greenhouseConfig";
import type { PinCategory } from "./pinCategory";

export type PinLocation =
  | { kind: "bed"; row: number; side: Side; ns: number }
  | { kind: "office"; x: number; y: number };

export interface PinEntry {
  id: string;
  category: PinCategory;
  comment: string;
  createdAt: string;
}

export interface Pin {
  id: string;
  location: PinLocation;
  entries: PinEntry[];
}

/** 保存前の位置情報。実体はPinLocationそのもの */
export type PinDraft = PinLocation;
