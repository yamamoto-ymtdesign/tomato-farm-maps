import { useState } from "react";
import type { PinDraft } from "../types/pin";
import type { PinCategory } from "../types/pinCategory";
import { formatPinLocation } from "../geometry/pinPosition";
import { CategoryPicker } from "./CategoryPicker";
import "./PinModal.css";

interface NewPinModalProps {
  target: PinDraft;
  onSave: (category: PinCategory, comment: string) => void;
  onClose: () => void;
}

export function NewPinModal({ target, onSave, onClose }: NewPinModalProps) {
  const [category, setCategory] = useState<PinCategory>("other");
  const [comment, setComment] = useState("");

  return (
    <div className="pin-modal-overlay" onClick={onClose}>
      <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="pin-modal__title">{formatPinLocation(target)}</h2>

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
            onClick={() => onSave(category, comment)}
            disabled={comment.trim().length === 0}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
