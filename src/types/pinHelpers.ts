import type { Pin, PinEntry } from "./pin";
import { getCategoryInfo } from "./pinCategory";

/** 一番新しいコメントを返す(entriesは追加順に並んでいる前提) */
export function getLatestEntry(pin: Pin): PinEntry | undefined {
  return pin.entries[pin.entries.length - 1];
}

/** ピンマーカーの色。最新コメントの種類の色を使う */
export function getPinColor(pin: Pin): string {
  const latest = getLatestEntry(pin);
  return latest ? getCategoryInfo(latest.category).color : getCategoryInfo("other").color;
}
