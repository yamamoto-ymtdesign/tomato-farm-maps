export type PinCategory = "disease" | "pest" | "equipment" | "task" | "other";

export interface PinCategoryInfo {
  value: PinCategory;
  label: string;
  color: string;
}

export const PIN_CATEGORIES: PinCategoryInfo[] = [
  { value: "disease", label: "病気", color: "#d32f2f" },
  { value: "pest", label: "害虫", color: "#f57c00" },
  { value: "equipment", label: "設備", color: "#1976d2" },
  { value: "task", label: "作業", color: "#388e3c" },
  { value: "other", label: "その他", color: "#757575" },
];

const CATEGORY_MAP = new Map(PIN_CATEGORIES.map((c) => [c.value, c]));

export function getCategoryInfo(category: PinCategory): PinCategoryInfo {
  return CATEGORY_MAP.get(category) ?? PIN_CATEGORIES[PIN_CATEGORIES.length - 1];
}
