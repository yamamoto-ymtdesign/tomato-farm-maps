import { useState } from "react";
import type { Pin, PinEntry } from "../types/pin";
import type { PinCategory } from "../types/pinCategory";
import { getCategoryInfo } from "../types/pinCategory";
import { formatPinLocation } from "../geometry/pinPosition";
import { CategoryPicker } from "./CategoryPicker";
import "./PinModal.css";

interface PinDetailModalProps {
  pin: Pin;
  onAddEntry: (category: PinCategory, comment: string) => void;
  onEditEntry: (entryId: string, category: PinCategory, comment: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onClose: () => void;
}

type Mode = { type: "list" } | { type: "add" } | { type: "edit"; entryId: string };

function EntryForm({
  initialCategory,
  initialComment,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialCategory: PinCategory;
  initialComment: string;
  submitLabel: string;
  onSubmit: (category: PinCategory, comment: string) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<PinCategory>(initialCategory);
  const [comment, setComment] = useState(initialComment);

  return (
    <div className="pin-modal__entry-form">
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
        <button type="button" className="pin-modal__button" onClick={onCancel}>
          キャンセル
        </button>
        <button
          type="button"
          className="pin-modal__button pin-modal__button--primary"
          onClick={() => onSubmit(category, comment)}
          disabled={comment.trim().length === 0}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: PinEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const info = getCategoryInfo(entry.category);
  return (
    <div className="pin-entry">
      <div className="pin-entry__header">
        <span className="pin-entry__category" style={{ background: info.color }}>
          {info.label}
        </span>
        <span className="pin-entry__date">{new Date(entry.createdAt).toLocaleString("ja-JP")}</span>
      </div>
      <p className="pin-entry__comment">{entry.comment}</p>
      <div className="pin-entry__actions">
        <button type="button" className="pin-entry__link" onClick={onEdit}>
          編集
        </button>
        <button type="button" className="pin-entry__link pin-entry__link--danger" onClick={onDelete}>
          削除
        </button>
      </div>
    </div>
  );
}

export function PinDetailModal({
  pin,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onClose,
}: PinDetailModalProps) {
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const sortedEntries = [...pin.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="pin-modal-overlay" onClick={onClose}>
      <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="pin-modal__title">{formatPinLocation(pin)}</h2>

        {mode.type === "list" && (
          <>
            <div className="pin-entry-list">
              {sortedEntries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onEdit={() => setMode({ type: "edit", entryId: entry.id })}
                  onDelete={() => onDeleteEntry(entry.id)}
                />
              ))}
            </div>
            <div className="pin-modal__actions">
              <button type="button" className="pin-modal__button" onClick={onClose}>
                閉じる
              </button>
              <button
                type="button"
                className="pin-modal__button pin-modal__button--primary"
                onClick={() => setMode({ type: "add" })}
              >
                ＋ 別のコメントを追加
              </button>
            </div>
          </>
        )}

        {mode.type === "add" && (
          <EntryForm
            initialCategory="other"
            initialComment=""
            submitLabel="追加"
            onCancel={() => setMode({ type: "list" })}
            onSubmit={(category, comment) => {
              onAddEntry(category, comment);
              setMode({ type: "list" });
            }}
          />
        )}

        {mode.type === "edit" &&
          (() => {
            const target = pin.entries.find((e) => e.id === mode.entryId);
            if (!target) return null;
            return (
              <EntryForm
                initialCategory={target.category}
                initialComment={target.comment}
                submitLabel="更新"
                onCancel={() => setMode({ type: "list" })}
                onSubmit={(category, comment) => {
                  onEditEntry(target.id, category, comment);
                  setMode({ type: "list" });
                }}
              />
            );
          })()}
      </div>
    </div>
  );
}
