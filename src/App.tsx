import { useEffect, useMemo, useRef, useState } from "react";
import { buildGreenhouseGeometry } from "./geometry/greenhouseConfig";
import type { Pin, PinDraft } from "./types/pin";
import { loadPins, savePins, exportPinsAsJson, parsePinsFromJson } from "./storage/pinStorage";
import { GreenhouseMap } from "./components/GreenhouseMap";
import { PinModal } from "./components/PinModal";
import "./App.css";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function App() {
  const geometry = useMemo(() => buildGreenhouseGeometry(), []);
  const [pins, setPins] = useState<Pin[]>(() => loadPins());
  const [draft, setDraft] = useState<PinDraft | null>(null);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    savePins(pins);
  }, [pins]);

  function handleMapTap(next: PinDraft) {
    setDraft(next);
  }

  function handleSaveNewPin(comment: string) {
    if (!draft) return;
    const now = new Date().toISOString();
    const pin: Pin = {
      id: createId(),
      row: draft.row,
      side: draft.side,
      ns: draft.ns,
      comment,
      createdAt: now,
      updatedAt: now,
    };
    setPins((prev) => [...prev, pin]);
    setDraft(null);
  }

  function handleUpdatePin(comment: string) {
    if (!editingPin) return;
    setPins((prev) =>
      prev.map((p) =>
        p.id === editingPin.id ? { ...p, comment, updatedAt: new Date().toISOString() } : p,
      ),
    );
    setEditingPin(null);
  }

  function handleDeletePin() {
    if (!editingPin) return;
    setPins((prev) => prev.filter((p) => p.id !== editingPin.id));
    setEditingPin(null);
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

  return (
    <div className="app">
      <header className="app__header">
        <h1>ミニトマトハウス マップ</h1>
        <div className="app__header-actions">
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
        <GreenhouseMap
          geometry={geometry}
          pins={pins}
          draft={draft}
          onMapTap={handleMapTap}
          onPinTap={setEditingPin}
        />
      </main>

      <p className="app__hint">ハウス内の気になる場所をタップするとピンを立てられます（ピン数: {pins.length}）</p>

      {draft && (
        <PinModal
          target={draft}
          onSave={handleSaveNewPin}
          onClose={() => setDraft(null)}
        />
      )}

      {editingPin && (
        <PinModal
          target={editingPin}
          onSave={handleUpdatePin}
          onDelete={handleDeletePin}
          onClose={() => setEditingPin(null)}
        />
      )}
    </div>
  );
}

export default App;
