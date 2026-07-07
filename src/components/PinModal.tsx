import { useState } from "react";
import type { Pin, PinDraft } from "../types/pin";
import { formatPinLocation } from "../geometry/pinPosition";
import "./PinModal.css";

interface PinModalProps {
  /** 新規作成の場合は位置情報のみ、編集の場合は既存ピン */
  target: PinDraft | Pin;
  onSave: (comment: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function isExistingPin(target: PinDraft | Pin): target is Pin {
  return "id" in target;
}

export function PinModal({ target, onSave, onDelete, onClose }: PinModalProps) {
  const [comment, setComment] = useState(isExistingPin(target) ? target.comment : "");

  return (
    <div className="pin-modal-overlay" onClick={onClose}>
      <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="pin-modal__title">{formatPinLocation(target)}</h2>
        <textarea
          className="pin-modal__textarea"
          placeholder="気になる内容を記録してください"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          autoFocus
        />
        {isExistingPin(target) && (
          <p className="pin-modal__meta">
            記録日時: {new Date(target.updatedAt).toLocaleString("ja-JP")}
          </p>
        )}
        <div className="pin-modal__actions">
          {isExistingPin(target) && onDelete && (
            <button type="button" className="pin-modal__button pin-modal__button--danger" onClick={onDelete}>
              削除
            </button>
          )}
          <button type="button" className="pin-modal__button" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="pin-modal__button pin-modal__button--primary"
            onClick={() => onSave(comment)}
            disabled={comment.trim().length === 0}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
