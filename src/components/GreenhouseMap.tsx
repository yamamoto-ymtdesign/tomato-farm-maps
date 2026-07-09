import { useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { GreenhouseGeometry } from "../geometry/greenhouseConfig";
import { findNearestLine, isInsideHouse, isInsideOffice } from "../geometry/greenhouseConfig";
import type { Pin, PinDraft } from "../types/pin";
import { locationToXY, rowExtentRange } from "../geometry/pinPosition";
import { getPinColor } from "../types/pinHelpers";
import "./GreenhouseMap.css";

interface GreenhouseMapProps {
  geometry: GreenhouseGeometry;
  pins: Pin[];
  draft: PinDraft | null;
  onMapTap: (draft: PinDraft) => void;
  onPinTap: (pin: Pin) => void;
}

const MARGIN_X = 4;
const MARGIN_TOP = 6;
const MARGIN_BOTTOM = 6;

export function GreenhouseMap({ geometry, pins, draft, onMapTap, onPinTap }: GreenhouseMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const viewBoxMinX = -MARGIN_X;
  const viewBoxMinY = -MARGIN_TOP;
  const viewBoxWidth = geometry.houseWidth + MARGIN_X * 2;
  const viewBoxHeight = geometry.office.y + geometry.office.height + MARGIN_BOTTOM - viewBoxMinY;

  function clientToMeters(clientX: number, clientY: number): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const transformed = point.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }

  function handleBackgroundClick(e: React.MouseEvent) {
    const p = clientToMeters(e.clientX, e.clientY);
    if (!p) return;
    if (isInsideHouse(geometry, p.x, p.y)) {
      const { row, side } = findNearestLine(geometry, p.x);
      onMapTap({ kind: "bed", row, side, ns: Math.round(p.y) });
    } else if (isInsideOffice(geometry, p.x, p.y)) {
      onMapTap({ kind: "office", x: Math.round(p.x), y: Math.round(p.y) });
    }
  }

  return (
    <div className="greenhouse-map">
      <TransformWrapper minScale={1} maxScale={6} doubleClick={{ mode: "zoomIn" }}>
        <TransformComponent wrapperClass="greenhouse-map__wrapper" contentClass="greenhouse-map__content">
          <svg
            ref={svgRef}
            viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
            className="greenhouse-map__svg"
            role="img"
            aria-label="ハウス俯瞰図"
          >
            {/* 北ラベル */}
            <text x={geometry.houseWidth / 2} y={-2.5} className="label label--compass">
              北
            </text>

            {/* ハウス外形 */}
            <rect
              x={0}
              y={0}
              width={geometry.houseWidth}
              height={geometry.houseLength}
              className="house-outline"
              onClick={handleBackgroundClick}
            />

            {/* 列(ベッド) */}
            {geometry.rows.map((line) => (
              <rect
                key={`bed-${line.row}`}
                x={line.xOmote}
                y={geometry.bedTop}
                width={line.xUra - line.xOmote}
                height={geometry.bedBottom - geometry.bedTop}
                className="bed-band"
                onClick={handleBackgroundClick}
              />
            ))}

            {/* 列番号ラベル */}
            {geometry.rows.map((line) => (
              <text key={`label-${line.row}`} x={line.xCenter} y={-0.8} className="label label--row">
                {line.row}
              </text>
            ))}

            {/* 支柱(門型) */}
            {geometry.rows.map((line) =>
              geometry.posts.map((post, i) => (
                <line
                  key={`post-${line.row}-${i}`}
                  x1={line.xOmote}
                  x2={line.xUra}
                  y1={post.y}
                  y2={post.y}
                  className="post-bar"
                />
              )),
            )}

            {/* 中央水路 */}
            <line
              x1={0}
              x2={geometry.houseWidth}
              y1={geometry.channelY}
              y2={geometry.channelY}
              className="water-channel"
            />
            <text x={geometry.houseWidth / 2} y={geometry.channelY - 0.8} className="label label--channel">
              水路
            </text>

            {/* 事務所 */}
            <rect
              x={geometry.office.x}
              y={geometry.office.y}
              width={geometry.office.width}
              height={geometry.office.height}
              className="office-outline"
              onClick={handleBackgroundClick}
            />
            <text
              x={geometry.office.x + geometry.office.width / 2}
              y={geometry.office.y + geometry.office.height / 2 + 0.5}
              className="label label--office"
            >
              事務所
            </text>
            {/* 事務所→ハウス入口(北面) */}
            <line
              x1={geometry.officeEntrance.x0}
              x2={geometry.officeEntrance.x1}
              y1={geometry.office.y}
              y2={geometry.office.y}
              className="entrance-marker"
            />
            {/* 事務所 外部入口(東面) */}
            <line
              x1={geometry.office.x + geometry.office.width}
              x2={geometry.office.x + geometry.office.width}
              y1={geometry.office.y + geometry.office.height * 0.2}
              y2={geometry.office.y + geometry.office.height * 0.8}
              className="entrance-marker"
            />

            {/* 既存ピン */}
            {pins.map((pin) => {
              if (pin.location.kind === "row") {
                const line = geometry.rows[pin.location.row - 1];
                const { y0, y1 } = rowExtentRange(geometry, pin.location.extent);
                const color = getPinColor(pin);
                const handleTap = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  onPinTap(pin);
                };
                return (
                  <g key={pin.id}>
                    <line
                      x1={line.xCenter}
                      x2={line.xCenter}
                      y1={y0}
                      y2={y1}
                      className="pin-marker pin-marker--row"
                      style={{ stroke: color }}
                      onClick={handleTap}
                    />
                    <circle
                      cx={line.xCenter}
                      cy={(y0 + y1) / 2}
                      r={0.6}
                      className="pin-marker"
                      style={{ fill: color }}
                      onClick={handleTap}
                    />
                  </g>
                );
              }
              const { x, y } = locationToXY(geometry, pin.location);
              return (
                <circle
                  key={pin.id}
                  cx={x}
                  cy={y}
                  r={0.6}
                  className="pin-marker"
                  style={{ fill: getPinColor(pin) }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinTap(pin);
                  }}
                />
              );
            })}

            {/* 選択中(未保存)のドラフトピン */}
            {draft && (
              <circle
                cx={locationToXY(geometry, draft).x}
                cy={locationToXY(geometry, draft).y}
                r={0.7}
                className="pin-marker pin-marker--draft"
              />
            )}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
