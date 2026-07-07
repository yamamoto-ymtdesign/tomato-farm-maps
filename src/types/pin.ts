import type { Side } from "../geometry/greenhouseConfig";

export interface Pin {
  id: string;
  row: number;
  side: Side;
  /** 北端からの距離(m)。ハウス内なら0〜80、事務所内ならnull */
  ns: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface PinDraft {
  row: number;
  side: Side;
  ns: number;
}
