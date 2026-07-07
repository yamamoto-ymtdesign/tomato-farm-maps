import { PIN_CATEGORIES } from "../types/pinCategory";
import type { PinCategory } from "../types/pinCategory";
import "./CategoryPicker.css";

interface CategoryPickerProps {
  value: PinCategory;
  onChange: (category: PinCategory) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="category-picker" role="radiogroup" aria-label="種類">
      {PIN_CATEGORIES.map((c) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          className={
            "category-picker__option" +
            (value === c.value ? " category-picker__option--selected" : "")
          }
          style={{ borderColor: c.color, color: value === c.value ? "#fff" : c.color, background: value === c.value ? c.color : "transparent" }}
          onClick={() => onChange(c.value)}
        >
          <span className="category-picker__dot" style={{ background: c.color }} />
          {c.label}
        </button>
      ))}
    </div>
  );
}
