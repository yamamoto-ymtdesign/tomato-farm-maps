import { useEffect, useMemo, useRef, useState } from "react";
import { buildGreenhouseGeometry } from "./geometry/greenhouseConfig";
import { isSameLocation } from "./geometry/pinPosition";
import type { Pin, PinDraft, PinLocation } from "./types/pin";
import type { PinCategory } from "./types/pinCategory";
import { loadPins, savePins, exportPinsAsJson, parsePinsFromJson } from "./storage/pinStorage";
import { GreenhouseMap } from "./components/GreenhouseMap";
import { NewPinModal } from "./components/NewPinModal";
import { PinDetailModal } from "./components/PinDetailModal";
import { PinListView } from "./components/PinListView";
import { createId } from "./utils/id";
import "./App.css";

type ViewMode = "map" | "list";

function App() {
  const geometry = useMemo(() => buildGreenhouseGeometry(), []);
  const [pins, setPins] = useState<Pin[]>(() => loadPins());
  const [draft, setDraft] = useState<PinDraft | null>(null);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    savePins(pins);
  }, [pins]);

  const editingPin = pins.find((p) => p.id === editingPinId) ?? null;

  function handleMapTap(tapped: PinDraft) {
    const nearby = pins.find((p) => isSameLocation(p.location, tapped));
    if (nearby) {
      setEditingPinId(nearby.id);
    } else {
      setDraft(tapped);
    }
  }

  function handleCreatePin(location: PinLocation, category: PinCategory, comment: string) {
    const pin: Pin = {
      id: createId(),
      location,
      entries: [{ id: createId(), category, comment, createdAt: new Date().toISOString() }],
    };
    setPins((prev) => [...prev, pin]);
    setDraft(null);
  }

  function handleAddEntry(category: PinCategory, comment: string) {
    if (!editingPin) return;
    const entry = { id: createId(), category, comment, createdAt: new Date().toISOString() };
    setPins((prev) =>
      prev.map((p) => (p.id === editingPin.id ? { ...p, entries: [...p.entries, entry] } : p)),
    );
  }

  function handleEditEntry(entryId: string, category: PinCategory, comment: string) {
    if (!editingPin) return;
    setPins((prev) =>
      prev.map((p) =>
        p.id === editingPin.id
          ? { ...p, entries: p.entries.map((e) => (e.id === entryId ? { ...e, category, comment } : e)) }
          : p,
      ),
    );
  }

  function handleDeleteEntry(entryId: string) {
    if (!editingPin) return;
    const remaining = editingPin.entries.filter((e) => e.id !== entryId);
    if (remaining.length === 0) {
      setPins((prev) => prev.filter((p) => p.id !== editingPin.id));
      setEditingPinId(null);
    } else {
      setPins((prev) => prev.map((p) => (p.id === editingPin.id ? { ...p, entries: remaining } : p)));
    }
  }

  function handleExport() {
    const blob = new Blob([exportPinsAsJson(pins)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tomato-farm-pins-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parsePinsFromJson(text);
      setPins(imported);
    } catch {
      window.alert("ファイルの読み込みに失敗しました");
    }
  }

  const totalComments = pins.reduce((sum, p) => sum + p.entries.length, 0);

  return (
    <div className="app">
      <header className="app__header">
        <h1>ミニトマトハウス マップ</h1>
        <div className="app__header-actions">
          <button type="button" onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}>
            {viewMode === "map" ? "一覧" : "地図"}
          </button>
          <button type="button" onClick={handleImportClick}>
            読込
          </button>
          <button type="button" onClick={handleExport}>
            書出
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="app__file-input"
            onChange={handleImportFile}
          />
        </div>
      </header>

      <main className="app__map">
        {viewMode === "map" ? (
          <GreenhouseMap
            geometry={geometry}
            pins={pins}
            draft={draft}
            onMapTap={handleMapTap}
            onPinTap={(pin) => setEditingPinId(pin.id)}
          />
        ) : (
          <PinListView pins={pins} onSelectPin={(pin) => setEditingPinId(pin.id)} />
        )}
      </main>

      {viewMode === "map" && (
        <p className="app__hint">
          ハウスや事務所の気になる場所をタップするとピンを立てられます（ピン数: {pins.length} / コメント数:{" "}
          {totalComments}）
        </p>
      )}

      {draft && <NewPinModal target={draft} onSave={handleCreatePin} onClose={() => setDraft(null)} />}

      {editingPin && (
        <PinDetailModal
          pin={editingPin}
          onAddEntry={handleAddEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          onClose={() => setEditingPinId(null)}
        />
      )}
    </div>
  );
}

export default App;
