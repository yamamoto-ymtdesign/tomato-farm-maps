import type { Side } from "../geometry/greenhouseConfig";
import type { PinCategory } from "./pinCategory";

/** 列のうちどこまでを指すか。全体/水路より北半分/水路より南半分 */
export type RowExtent = "full" | "north" | "south";

export type PinLocation =
  | { kind: "bed"; row: number; side: Side; ns: number }
  | { kind: "row"; row: number; extent: RowExtent }
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
