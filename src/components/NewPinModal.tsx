import { useState } from "react";
import type { PinDraft, PinLocation, RowExtent } from "../types/pin";
import type { PinCategory } from "../types/pinCategory";
import { formatPinLocation } from "../geometry/pinPosition";
import { CategoryPicker } from "./CategoryPicker";
import "./PinModal.css";

interface NewPinModalProps {
  target: PinDraft;
  onSave: (location: PinLocation, category: PinCategory, comment: string) => void;
  onClose: () => void;
}

type Scope = "point" | RowExtent;

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: "point", label: "地点" },
  { value: "full", label: "列全体" },
  { value: "north", label: "北半分" },
  { value: "south", label: "南半分" },
];

export function NewPinModal({ target, onSave, onClose }: NewPinModalProps) {
  const [scope, setScope] = useState<Scope>("point");
  const [category, setCategory] = useState<PinCategory>("other");
  const [comment, setComment] = useState("");

  const location: PinLocation =
    target.kind === "bed" && scope !== "point" ? { kind: "row", row: target.row, extent: scope } : target;

  return (
    <div className="pin-modal-overlay" onClick={onClose}>
      <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="pin-modal__title">{formatPinLocation(location)}</h2>

        {target.kind === "bed" && (
          <>
            <p className="pin-modal__label">対象範囲</p>
            <div className="scope-picker">
              {SCOPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={
                    "scope-picker__option" +
                    (scope === opt.value ? " scope-picker__option--selected" : "")
                  }
                  onClick={() => setScope(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="pin-modal__label">種類</p>
        <CategoryPicker value={category} onChange={setCategory} />

        <textarea
          className="pin-modal__textarea"
          placeholder="気になる内容を記録してください"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          autoFocus
        />

        <div className="pin-modal__actions">
          <button type="button" className="pin-modal__button" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="pin-modal__button pin-modal__button--primary"
            onClick={() => onSave(location, category, comment)}
            disabled={comment.trim().length === 0}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
