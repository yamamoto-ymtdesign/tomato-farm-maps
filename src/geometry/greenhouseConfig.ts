// ハウスの実寸法をもとにしたレイアウト定義。
// 数値は現状のヒアリング内容ベースの概算値。実測が取れ次第ここを更新すれば
// 地図全体（SVG描画・タップ判定）に反映される。

export type Side = "omote" | "ura";

export interface RowLine {
  /** 1〜12。1列目が西側、12列目が東側 */
  row: number;
  /** ベッドの中心X座標（m、西端からの距離） */
  xCenter: number;
  /** 表側ラインのX座標 */
  xOmote: number;
  /** 裏側ラインのX座標 */
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
  /** 1列(ベッド)の幅に対する表裏ラインの間隔の割合 (0-1) */
  bedLineSpanRatio: number;
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
  bedLineSpanRatio: 0.65,
  postsNorth: 7,
  postsSouth: 8,
  office: {
    width: 10,
    height: 5,
  },
};

/** 等間隔にcount個の点を(0, span)の開区間に配置する */
function evenlySpaced(span: number, count: number, offset = 0): number[] {
  return Array.from({ length: count }, (_, i) => offset + (span * (i + 1)) / (count + 1));
}

export function buildGreenhouseGeometry(
  config: GreenhouseConfig = DEFAULT_GREENHOUSE_CONFIG,
): GreenhouseGeometry {
  const { houseWidth, houseLength, rowCount, bedLineSpanRatio, postsNorth, postsSouth, office } =
    config;

  const channelY = houseLength / 2;
  const sliceWidth = houseWidth / rowCount;
  const halfBedSpan = (sliceWidth * bedLineSpanRatio) / 2;

  const rows: RowLine[] = Array.from({ length: rowCount }, (_, i) => {
    const row = i + 1;
    const xCenter = (row - 0.5) * sliceWidth;
    return {
      row,
      xCenter,
      xOmote: xCenter - halfBedSpan,
      xUra: xCenter + halfBedSpan,
    };
  });

  const posts: PostPosition[] = [
    ...evenlySpaced(channelY, postsNorth).map((y): PostPosition => ({ y, half: "north" })),
    ...evenlySpaced(houseLength - channelY, postsSouth, channelY).map(
      (y): PostPosition => ({ y, half: "south" }),
    ),
  ];

  return {
    houseWidth,
    houseLength,
    rowCount,
    channelY,
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
