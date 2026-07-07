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
  rows: RowLine[];
  posts: PostPosition[];
}

export interface GreenhouseConfig {
  /** メインハウス 横幅(東西, m) */
  houseWidth: number;
  /** メインハウス 縦幅(南北, m) */
  houseLength: number;
  /** ベッドの列数 */
  rowCount: number;
  /** 通路幅 / ベッド幅 の比率(列間の通路) */
  aisleToBedWidthRatio: number;
  /** 外壁側の通路幅 / 列間の通路幅 の比率(1列目表・12列目裏の外側通路) */
  outerAisleToAisleRatio: number;
  /** ベッド南北端から外壁までのマージン(m) */
  bedEndMargin: number;
  /** 水路より北側の支柱本数 */
  postsNorth: number;
  /** 水路より南側の支柱本数 */
  postsSouth: number;
  office: {
    width: number;
    height: number;
  };
}

export const DEFAULT_GREENHOUSE_CONFIG: GreenhouseConfig = {
  houseWidth: 25,
  houseLength: 80,
  rowCount: 12,
  aisleToBedWidthRatio: 1,
  outerAisleToAisleRatio: 3,
  bedEndMargin: 2,
  postsNorth: 7,
  postsSouth: 8,
  office: {
    width: 10,
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
    houseWidth,
    houseLength,
    rowCount,
    aisleToBedWidthRatio,
    outerAisleToAisleRatio,
    bedEndMargin,
    postsNorth,
    postsSouth,
    office,
  } = config;

  const channelY = houseLength / 2;

  // houseWidth = 2*outerAisleWidth + rowCount*bedWidth + (rowCount-1)*aisleWidth を
  // bedWidth について解く
  const widthUnits =
    2 * aisleToBedWidthRatio * outerAisleToAisleRatio + rowCount + (rowCount - 1) * aisleToBedWidthRatio;
  const bedWidth = houseWidth / widthUnits;
  const aisleWidth = bedWidth * aisleToBedWidthRatio;
  const outerAisleWidth = aisleWidth * outerAisleToAisleRatio;

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
      width: office.width,
      height: office.height,
    },
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
