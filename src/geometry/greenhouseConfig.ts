// ハウスの実寸法をもとにしたレイアウト定義。
// 数値は現状のヒアリング内容ベースの概算値。実測が取れ次第ここを更新すれば
// 地図全体（SVG描画・タップ判定）に反映される。

export type Side = "omote" | "ura";

export interface RowLine {
  /** 1〜12。1列目が西側、12列目が東側 */
  row: number;
  /** ベッドの中心X座標（m、西端からの距離） */
  xCenter: number;
  /** 表側(西側)ラインのX座標 = ベッド西端 */
  xOmote: number;
  /** 裏側(東側)ラインのX座標 = ベッド東端 */
  xUra: number;
}

export interface PostPosition {
  /** 北端からの距離（m） */
  y: number;
  half: "north" | "south";
}

export interface OfficeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GreenhouseGeometry {
  houseWidth: number;
  houseLength: number;
  rowCount: number;
  channelY: number;
  /** ベッドの北端Y座標(北端マージン分、外壁より内側) */
  bedTop: number;
  /** ベッドの南端Y座標(南端マージン分、外壁より内側) */
  bedBottom: number;
  bedWidth: number;
  aisleWidth: number;
  outerAisleWidth: number;
  office: OfficeRect;
  /** 事務所→ハウスの入口(北面)のX座標範囲 */
  officeEntrance: { x0: number; x1: number };
  rows: RowLine[];
  posts: PostPosition[];
}

export interface GreenhouseConfig {
  /** メインハウス 縦幅(南北, m) */
  houseLength: number;
  /** ベッドの列数 */
  rowCount: number;
  /** ベッド幅(m) */
  bedWidth: number;
  /** 列と列の間の通路幅(m) */
  aisleWidth: number;
  /** 外壁側の通路幅(m)。1列目表・12列目裏から外壁までの通路 */
  outerAisleWidth: number;
  /** ベッド南北端から外壁までのマージン(m) */
  bedEndMargin: number;
  /** 水路より北側の支柱本数 */
  postsNorth: number;
  /** 水路より南側の支柱本数 */
  postsSouth: number;
  office: {
    /** 事務所の東端をこの列のura(東端)ラインに揃える */
    extendsToRow: number;
    /** ハウスへの入口(北面)をこの2列の間に置く */
    entranceBetweenRows: [number, number];
    height: number;
  };
}

// 2026-07改修: ハウス幅を25m→40mへ拡張。ベッド幅・列間通路幅は25m時代の
// 値を40/25倍に拡大する一方、外側通路(1列目表・12列目裏〜外壁)は逆に
// 半分に縮小した。ハウス全幅はこれらの合計から導かれる(結果として約34.3m)。
const PREVIOUS_HOUSE_WIDTH = 25;
const PREVIOUS_ROW_COUNT = 12;
const PREVIOUS_AISLE_TO_BED_RATIO = 1;
const PREVIOUS_OUTER_TO_AISLE_RATIO = 3;
const PREVIOUS_WIDTH_UNITS =
  2 * PREVIOUS_AISLE_TO_BED_RATIO * PREVIOUS_OUTER_TO_AISLE_RATIO +
  PREVIOUS_ROW_COUNT +
  (PREVIOUS_ROW_COUNT - 1) * PREVIOUS_AISLE_TO_BED_RATIO;
const PREVIOUS_BED_WIDTH = PREVIOUS_HOUSE_WIDTH / PREVIOUS_WIDTH_UNITS;
const PREVIOUS_AISLE_WIDTH = PREVIOUS_BED_WIDTH * PREVIOUS_AISLE_TO_BED_RATIO;
const PREVIOUS_OUTER_AISLE_WIDTH = PREVIOUS_AISLE_WIDTH * PREVIOUS_OUTER_TO_AISLE_RATIO;

const WIDTH_SCALE = 40 / 25;

export const DEFAULT_GREENHOUSE_CONFIG: GreenhouseConfig = {
  houseLength: 80,
  rowCount: 12,
  bedWidth: PREVIOUS_BED_WIDTH * WIDTH_SCALE,
  aisleWidth: PREVIOUS_AISLE_WIDTH * WIDTH_SCALE,
  outerAisleWidth: PREVIOUS_OUTER_AISLE_WIDTH / 2,
  bedEndMargin: 2,
  postsNorth: 7,
  postsSouth: 7,
  office: {
    extendsToRow: 5,
    entranceBetweenRows: [4, 5],
    height: 5,
  },
};

/** 等間隔にcount個の点を(offset, offset+span)の開区間に配置する */
function evenlySpaced(span: number, count: number, offset = 0): number[] {
  return Array.from({ length: count }, (_, i) => offset + (span * (i + 1)) / (count + 1));
}

export function buildGreenhouseGeometry(
  config: GreenhouseConfig = DEFAULT_GREENHOUSE_CONFIG,
): GreenhouseGeometry {
  const {
    houseLength,
    rowCount,
    bedWidth,
    aisleWidth,
    outerAisleWidth,
    bedEndMargin,
    postsNorth,
    postsSouth,
    office,
  } = config;

  const channelY = houseLength / 2;
  const houseWidth = 2 * outerAisleWidth + rowCount * bedWidth + (rowCount - 1) * aisleWidth;

  const rows: RowLine[] = Array.from({ length: rowCount }, (_, i) => {
    const row = i + 1;
    const bedLeft = outerAisleWidth + i * (bedWidth + aisleWidth);
    const bedRight = bedLeft + bedWidth;
    return {
      row,
      xCenter: (bedLeft + bedRight) / 2,
      xOmote: bedLeft,
      xUra: bedRight,
    };
  });

  const bedTop = bedEndMargin;
  const bedBottom = houseLength - bedEndMargin;

  const posts: PostPosition[] = [
    ...evenlySpaced(channelY - bedTop, postsNorth, bedTop).map(
      (y): PostPosition => ({ y, half: "north" }),
    ),
    ...evenlySpaced(bedBottom - channelY, postsSouth, channelY).map(
      (y): PostPosition => ({ y, half: "south" }),
    ),
  ];

  const officeWidth = rows[office.extendsToRow - 1].xUra;
  const [entranceRowA, entranceRowB] = office.entranceBetweenRows;
  const officeEntrance = {
    x0: rows[entranceRowA - 1].xUra,
    x1: rows[entranceRowB - 1].xOmote,
  };

  return {
    houseWidth,
    houseLength,
    rowCount,
    channelY,
    bedTop,
    bedBottom,
    bedWidth,
    aisleWidth,
    outerAisleWidth,
    office: {
      x: 0,
      y: houseLength,
      width: officeWidth,
      height: office.height,
    },
    officeEntrance,
    rows,
    posts,
  };
}

/** タップされたSVG座標(x,y メートル)から最も近い列/表裏を求める */
export function findNearestLine(
  geometry: GreenhouseGeometry,
  x: number,
): { row: number; side: Side } {
  let best = { row: 1, side: "omote" as Side, dist: Infinity };
  for (const line of geometry.rows) {
    const distOmote = Math.abs(x - line.xOmote);
    const distUra = Math.abs(x - line.xUra);
    if (distOmote < best.dist) best = { row: line.row, side: "omote", dist: distOmote };
    if (distUra < best.dist) best = { row: line.row, side: "ura", dist: distUra };
  }
  return { row: best.row, side: best.side };
}

/** 座標(x,y メートル)がハウス本体の内側かどうか */
export function isInsideHouse(geometry: GreenhouseGeometry, x: number, y: number): boolean {
  return x >= 0 && x <= geometry.houseWidth && y >= 0 && y <= geometry.houseLength;
}

/** 座標(x,y メートル)が事務所の内側かどうか */
export function isInsideOffice(geometry: GreenhouseGeometry, x: number, y: number): boolean {
  const { office } = geometry;
  return x >= office.x && x <= office.x + office.width && y >= office.y && y <= office.y + office.height;
}
