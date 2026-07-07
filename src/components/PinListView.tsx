import { useMemo, useState } from "react";
import type { Pin, PinEntry } from "../types/pin";
import type { PinCategory } from "../types/pinCategory";
import { PIN_CATEGORIES, getCategoryInfo } from "../types/pinCategory";
import { formatPinLocation } from "../geometry/pinPosition";
import "./PinListView.css";

interface PinListViewProps {
  pins: Pin[];
  onSelectPin: (pin: Pin) => void;
}

type FilterValue = "all" | PinCategory;

interface FlatEntry {
  pin: Pin;
  entry: PinEntry;
}

export function PinListView({ pins, onSelectPin }: PinListViewProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const flatEntries = useMemo(() => {
    const all: FlatEntry[] = pins.flatMap((pin) => pin.entries.map((entry) => ({ pin, entry })));
    all.sort((a, b) => b.entry.createdAt.localeCompare(a.entry.createdAt));
    return filter === "all" ? all : all.filter((e) => e.entry.category === filter);
  }, [pins, filter]);

  return (
    <div className="pin-list-view">
      <div className="pin-list-view__filters">
        <button
          type="button"
          className={"pin-list-view__filter" + (filter === "all" ? " pin-list-view__filter--active" : "")}
          onClick={() => setFilter("all")}
        >
          すべて
        </button>
        {PIN_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            className={
              "pin-list-view__filter" + (filter === c.value ? " pin-list-view__filter--active" : "")
            }
            style={
              filter === c.value
                ? { background: c.color, borderColor: c.color, color: "#fff" }
                : { borderColor: c.color, color: c.color }
            }
            onClick={() => setFilter(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {flatEntries.length === 0 && <p className="pin-list-view__empty">記録がありません</p>}

      <ul className="pin-list-view__list">
        {flatEntries.map(({ pin, entry }) => {
          const info = getCategoryInfo(entry.category);
          return (
            <li key={entry.id}>
              <button
                type="button"
                className="pin-list-view__item"
                onClick={() => onSelectPin(pin)}
              >
                <div className="pin-list-view__item-header">
                  <span className="pin-list-view__category" style={{ background: info.color }}>
                    {info.label}
                  </span>
                  <span className="pin-list-view__location">{formatPinLocation(pin.location)}</span>
                </div>
                <p className="pin-list-view__comment">{entry.comment}</p>
                <span className="pin-list-view__date">
                  {new Date(entry.createdAt).toLocaleString("ja-JP")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
