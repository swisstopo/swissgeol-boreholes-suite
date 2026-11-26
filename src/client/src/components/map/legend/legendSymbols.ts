import { theme } from "../../../AppTheme.ts";

// All paths are in a 30 x 30 box centred on the borehole location. They come from the design (Figma frame "Alle Legenden" and its prototype).
interface SymbolShape {
  // Filled outline of the symbol.
  path: string;
  // Path stroked in the symbol's stroke colour.
  strokePath: string;
  strokeWidth: number;
  // Clips the stroke to the filled outline, so only its inner half is visible.
  strokeInside: boolean;
  // White outline around the symbol, keeps it readable on dark basemaps.
  haloPath: string;
  haloWidth: number;
}

export interface LegendSymbol extends SymbolShape {
  fill: string;
  stroke: string;
  shadow: string;
}

const hexagon: SymbolShape = {
  path: "M14.5 6.28868C14.8094 6.11004 15.1906 6.11004 15.5 6.28868L22.2942 10.2113C22.6036 10.39 22.7942 10.7201 22.7942 11.0774V18.9226C22.7942 19.2799 22.6036 19.61 22.2942 19.7887L15.5 23.7113C15.1906 23.89 14.8094 23.89 14.5 23.7113L7.70577 19.7887C7.39637 19.61 7.20577 19.2799 7.20577 18.9226V11.0774C7.20577 10.7201 7.39637 10.39 7.70577 10.2113L14.5 6.28868Z",
  strokePath: "M21.7939 11.0771V18.9229L15 22.8457L8.20605 18.9229V11.0771L15 7.1543L21.7939 11.0771Z",
  strokeWidth: 2,
  strokeInside: false,
  haloPath:
    "M14 5.42285C14.6188 5.06559 15.3812 5.06559 16 5.42285L22.7939 9.3457C23.4127 9.70293 23.7939 10.3627 23.7939 11.0771V18.9229C23.7939 19.6373 23.4127 20.2971 22.7939 20.6543L16 24.5771C15.3812 24.9344 14.6188 24.9344 14 24.5771L7.20605 20.6543C6.58731 20.2971 6.20613 19.6373 6.20605 18.9229V11.0771C6.20613 10.3627 6.58731 9.70294 7.20605 9.3457L14 5.42285Z",
  haloWidth: 2,
};

const plus: SymbolShape = {
  path: "M17.5625 5.5L12.4375 5.5C11.8852 5.5 11.4375 5.94772 11.4375 6.5V11.4375H6.5C5.94772 11.4375 5.5 11.8852 5.5 12.4375L5.5 17.5625C5.5 18.1148 5.94772 18.5625 6.5 18.5625H11.4375V23.5C11.4375 24.0523 11.8852 24.5 12.4375 24.5H17.5625C18.1148 24.5 18.5625 24.0523 18.5625 23.5V18.5625H23.5C24.0523 18.5625 24.5 18.1148 24.5 17.5625V12.4375C24.5 11.8852 24.0523 11.4375 23.5 11.4375H18.5625V6.5C18.5625 5.94772 18.1148 5.5 17.5625 5.5Z",
  strokePath: "M17.5625 6.5V12.4375H23.5V17.5625H17.5625V23.5H12.4375V17.5625H6.5L6.5 12.4375H12.4375V6.5L17.5625 6.5Z",
  strokeWidth: 2,
  strokeInside: false,
  haloPath:
    "M17.5625 4.5C18.6671 4.5 19.5625 5.39543 19.5625 6.5V10.4375H23.5C24.6046 10.4375 25.5 11.3329 25.5 12.4375V17.5625C25.5 18.6671 24.6046 19.5625 23.5 19.5625H19.5625V23.5C19.5625 24.6046 18.6671 25.5 17.5625 25.5H12.4375C11.3329 25.5 10.4375 24.6046 10.4375 23.5V19.5625H6.5C5.39543 19.5625 4.5 18.6671 4.5 17.5625L4.5 12.4375C4.5 11.3329 5.39543 10.4375 6.5 10.4375H10.4375V6.5C10.4375 5.39543 11.3329 4.5 12.4375 4.5L17.5625 4.5Z",
  haloWidth: 2,
};

const pentagon: SymbolShape = {
  path: "M14.4122 6.42705C14.7627 6.17241 15.2373 6.17241 15.5878 6.42705L22.9717 11.7918C23.3222 12.0464 23.4689 12.4978 23.335 12.9098L20.5146 21.5902C20.3807 22.0022 19.9968 22.2812 19.5635 22.2812H10.4365C10.0032 22.2812 9.61929 22.0022 9.48542 21.5902L6.66501 12.9098C6.53113 12.4978 6.67779 12.0464 7.02828 11.7918L14.4122 6.42705Z",
  strokePath: "M22.3838 12.6006L19.5635 21.2812H10.4365L7.61621 12.6006L15 7.23633L22.3838 12.6006Z",
  strokeWidth: 2,
  strokeInside: false,
  haloPath:
    "M13.8242 5.61816C14.5252 5.10888 15.4748 5.10888 16.1758 5.61816L23.5596 10.9824C24.2605 11.4917 24.5538 12.3947 24.2861 13.2188L21.4658 21.8994C21.198 22.7234 20.4299 23.2812 19.5635 23.2812H10.4365C9.57012 23.2812 8.80197 22.7234 8.53418 21.8994L5.71387 13.2188C5.44618 12.3947 5.73949 11.4917 6.44043 10.9824L13.8242 5.61816Z",
  haloWidth: 2,
};

const triangle: SymbolShape = {
  path: "M14.1318 7.76943C14.5156 7.09761 15.4843 7.09761 15.8682 7.76943L24.1451 22.2539C24.526 22.9205 24.0446 23.75 23.2768 23.75H6.72318C5.95536 23.75 5.47399 22.9205 5.85494 22.2539L14.1318 7.76943Z",
  strokePath: "M23.2764 22.75H6.72363L15 8.26562L23.2764 22.75Z",
  strokeWidth: 2,
  strokeInside: false,
  haloPath:
    "M13.2637 7.27344C14.0315 5.92981 15.9685 5.92981 16.7363 7.27344L25.0137 21.7578C25.7753 23.0911 24.8119 24.75 23.2764 24.75H6.72363C5.18807 24.75 4.22467 23.0911 4.98633 21.7578L13.2637 7.27344Z",
  haloWidth: 2,
};

const rotatedSquare: SymbolShape = {
  path: "M15.7071 5.8077L24.1924 14.2930A1 1 0 0 1 24.1924 15.7072L15.7071 24.1925A1 1 0 0 1 14.2929 24.1925L5.8076 15.7072A1 1 0 0 1 5.8076 14.2930L14.2929 5.8077A1 1 0 0 1 15.7071 5.8077Z",
  strokePath:
    "M15.7071 5.8077L24.1924 14.2930A1 1 0 0 1 24.1924 15.7072L15.7071 24.1925A1 1 0 0 1 14.2929 24.1925L5.8076 15.7072A1 1 0 0 1 5.8076 14.2930L14.2929 5.8077A1 1 0 0 1 15.7071 5.8077Z",
  strokeWidth: 4,
  strokeInside: true,
  haloPath:
    "M16.4142 5.1006L24.8995 13.5859A2 2 0 0 1 24.8995 16.4143L16.4142 24.8996A2 2 0 0 1 13.5858 24.8996L5.1005 16.4143A2 2 0 0 1 5.1005 13.5859L13.5858 5.1006A2 2 0 0 1 16.4142 5.1006Z",
  haloWidth: 2,
};

const diamond: SymbolShape = {
  path: "M8.85908 14.452L14.2088 6.28687C14.6054 5.68163 15.4936 5.68487 15.8857 6.293L21.1506 14.4581C21.3633 14.788 21.3633 15.212 21.1506 15.5419L15.8857 23.707C15.4936 24.3151 14.6054 24.3184 14.2088 23.7131L8.85908 15.548C8.64101 15.2152 8.64101 14.7848 8.85908 14.452Z",
  strokePath: "M20.3105 15L15.0449 23.165L9.69531 15L15.0449 6.83496L20.3105 15Z",
  strokeWidth: 2,
  strokeInside: false,
  haloPath:
    "M13.3721 5.73926C14.1652 4.52876 15.9423 4.53472 16.7266 5.75098L21.9912 13.916C22.4167 14.5759 22.4167 15.4241 21.9912 16.084L16.7266 24.249C15.9423 25.4653 14.1652 25.4712 13.3721 24.2607L8.02246 16.0957C7.58663 15.4302 7.58663 14.5698 8.02246 13.9043L13.3721 5.73926Z",
  haloWidth: 2,
};

const cross: SymbolShape = {
  path: "M23.5295 10.0944L19.9056 6.47049C19.515 6.07997 18.8819 6.07997 18.4913 6.47049L15 9.96183L11.5087 6.47049C11.1181 6.07997 10.485 6.07997 10.0944 6.47049L6.47052 10.0944C6.08 10.4849 6.08 11.1181 6.47052 11.5086L9.96186 15L6.47052 18.4913C6.08 18.8818 6.08 19.515 6.47052 19.9055L10.0944 23.5294C10.485 23.92 11.1181 23.92 11.5087 23.5294L15 20.0381L18.4913 23.5294C18.8819 23.92 19.515 23.92 19.9056 23.5294L23.5295 19.9055C23.92 19.515 23.92 18.8818 23.5295 18.4913L20.0381 15L23.5295 11.5086C23.92 11.1181 23.92 10.4849 23.5295 10.0944Z",
  strokePath:
    "M22.8224 10.8015L18.6239 15L22.8224 19.1984L19.1984 22.8223L15 18.6239L10.8016 22.8223L7.17763 19.1984L11.3761 15L7.17763 10.8015L10.8016 7.1776L15 11.376L19.1984 7.1776L22.8224 10.8015Z",
  strokeWidth: 2,
  strokeInside: false,
  haloPath:
    "M24.5901 9.03376C25.5664 10.0101 25.5664 11.593 24.5901 12.5693L22.1595 15L24.5901 17.4306C25.5664 18.407 25.5664 19.9899 24.5901 20.9662L20.9662 24.5901C19.9899 25.5664 18.407 25.5664 17.4307 24.5901L15 22.1594L12.5693 24.5901C11.593 25.5664 10.0101 25.5664 9.03379 24.5901L5.40986 20.9662C4.43355 19.9899 4.43355 18.407 5.40986 17.4306L7.84054 15L5.40986 12.5693C4.43355 11.593 4.43355 10.0101 5.40986 9.03376L9.03379 5.40983C10.0101 4.43352 11.593 4.43352 12.5693 5.40983L15 7.84051L17.4307 5.40983C18.407 4.43352 19.9899 4.43352 20.9662 5.40983L24.5901 9.03376Z",
  haloWidth: 3,
};

const square: SymbolShape = {
  path: "M8 7L22 7A1 1 0 0 1 23 8L23 22A1 1 0 0 1 22 23L8 23A1 1 0 0 1 7 22L7 8A1 1 0 0 1 8 7Z",
  strokePath: "M8 7L22 7A1 1 0 0 1 23 8L23 22A1 1 0 0 1 22 23L8 23A1 1 0 0 1 7 22L7 8A1 1 0 0 1 8 7Z",
  strokeWidth: 4,
  strokeInside: true,
  haloPath:
    "M8 5.5L22 5.5A2.5 2.5 0 0 1 24.5 8L24.5 22A2.5 2.5 0 0 1 22 24.5L8 24.5A2.5 2.5 0 0 1 5.5 22L5.5 8A2.5 2.5 0 0 1 8 5.5Z",
  haloWidth: 3,
};

// The triangle pointing down, used for the borehole length and the CCS purposes.
const invertedTriangle: SymbolShape = {
  path: "M15.8682 22.2306C15.4844 22.9024 14.5157 22.9024 14.1318 22.2306L5.85494 7.74614C5.47399 7.07948 5.95536 6.25 6.72318 6.25L23.2768 6.25C24.0446 6.25 24.526 7.07948 24.1451 7.74614L15.8682 22.2306Z",
  strokePath: "M6.72363 7.25L23.2764 7.25L15 21.7344L6.72363 7.25Z",
  strokeWidth: 2,
  strokeInside: false,
  haloPath:
    "M16.7363 22.7266C15.9685 24.0702 14.0315 24.0702 13.2637 22.7266L4.98633 8.24219C4.22467 6.90891 5.18807 5.25 6.72363 5.25L23.2764 5.25C24.8119 5.25 25.7753 6.90891 25.0137 8.24219L16.7363 22.7266Z",
  haloWidth: 2,
};

const { symbol: colors } = theme.palette.map;

// Every symbol is one object, so map styles can be cached per symbol.
export const legendSymbols = {
  purpleHexagon: { ...hexagon, ...colors.purple },
  yellowPlus: { ...plus, ...colors.yellow },
  redPentagon: { ...pentagon, ...colors.red },
  orangeTriangle: { ...triangle, ...colors.orange },
  pinkRotatedSquare: { ...rotatedSquare, ...colors.pink },
  greyDiamond: { ...diamond, ...colors.grey },
  lightGreyDiamond: { ...diamond, ...colors.lightGrey },
  redCross: { ...cross, ...colors.red },
  pinkCross: { ...cross, ...colors.pink },
  pinkSquare: { ...square, ...colors.pink },
  redHexagon: { ...hexagon, ...colors.red },
  orangeHexagon: { ...hexagon, ...colors.orange },
  pinkHexagon: { ...hexagon, ...colors.pink },
  yellowRotatedSquare: { ...rotatedSquare, ...colors.yellow },
  magenta1Square: { ...square, ...colors.magenta1 },
  magenta2Square: { ...square, ...colors.magenta2 },
  magenta3Square: { ...square, ...colors.magenta3 },
  violet1Hexagon: { ...hexagon, ...colors.violet1 },
  violet2Hexagon: { ...hexagon, ...colors.violet2 },
  violet3Hexagon: { ...hexagon, ...colors.violet3 },
  violet4Hexagon: { ...hexagon, ...colors.violet4 },
  violet5Hexagon: { ...hexagon, ...colors.violet5 },
  crimson1Pentagon: { ...pentagon, ...colors.crimson1 },
  crimson2Pentagon: { ...pentagon, ...colors.crimson2 },
  crimson3Pentagon: { ...pentagon, ...colors.crimson3 },
  crimson4Pentagon: { ...pentagon, ...colors.crimson4 },
  amber1InvertedTriangle: { ...invertedTriangle, ...colors.amber1 },
  amber2InvertedTriangle: { ...invertedTriangle, ...colors.amber2 },
  amber3InvertedTriangle: { ...invertedTriangle, ...colors.amber3 },
  brown1RotatedSquare: { ...rotatedSquare, ...colors.brown1 },
  brown2RotatedSquare: { ...rotatedSquare, ...colors.brown2 },
  brown3RotatedSquare: { ...rotatedSquare, ...colors.brown3 },
  brown4RotatedSquare: { ...rotatedSquare, ...colors.brown4 },
  ochrePlus: { ...plus, ...colors.ochre },
  brown4Plus: { ...plus, ...colors.brown4 },
  depth1InvertedTriangle: { ...invertedTriangle, ...colors.depth1 },
  depth2InvertedTriangle: { ...invertedTriangle, ...colors.depth2 },
  depth3InvertedTriangle: { ...invertedTriangle, ...colors.depth3 },
  depth4InvertedTriangle: { ...invertedTriangle, ...colors.depth4 },
  depth5InvertedTriangle: { ...invertedTriangle, ...colors.depth5 },
  depth6InvertedTriangle: { ...invertedTriangle, ...colors.depth6 },
  depth7InvertedTriangle: { ...invertedTriangle, ...colors.depth7 },
  depth8InvertedTriangle: { ...invertedTriangle, ...colors.depth8 },
} as const satisfies Record<string, LegendSymbol>;
