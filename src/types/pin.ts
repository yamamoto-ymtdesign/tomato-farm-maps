import type { Side } from "../geometry/greenhouseConfig";
import type { PinCategory } from "./pinCategory";

export interface PinEntry {
  id: string;
  category: PinCategory;
  comment: string;
  createdAt: string;
}

export interface Pin {
  id: string;
  row: number;
  side: Side;
  /** 北端からの距離(m)。ハウス内なら0〜80、事務所内ならnull */
  ns: number;
  entries: PinEntry[];
}

export interface PinDraft {
  row: number;
  side: Side;
  ns: number;
}
