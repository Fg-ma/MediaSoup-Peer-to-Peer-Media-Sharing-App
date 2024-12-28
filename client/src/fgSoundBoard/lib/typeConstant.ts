export type SoundEffects = Record<
  number,
  {
    path: string;
    playing: boolean;
    pressed: boolean;
    seizureColor: BoardEffectColors | undefined;
    classes: string[];
  }
>;

export type SoundEffectsMetaData = Record<
  number,
  { duration: number; timeoutOnMetaLoaded: boolean }
>;

export type CrazyBoardEffects =
  | "topRightDiagonal"
  | "topLeftDiagonal"
  | "bottomRightDiagonal"
  | "bottomLeftDiagonal"
  | "verticalSweep"
  | "horizontalSweep"
  | "reverseVerticalSweep"
  | "reverseHorizontalSweep"
  | "scissor"
  | "x"
  | "pulse"
  | "smallSpin"
  | "largeSpin"
  | "cross"
  | "gravity"
  | "antigravity"
  | "topSmile"
  | "bottomSmile"
  | "leftSmile"
  | "rightSmile"
  | "spiral"
  | "vTop"
  | "vBottom"
  | "vLeft"
  | "vRight"
  | "topRightDiagonalRays"
  | "topLeftDiagonalRays"
  | "bottomRightDiagonalRays"
  | "bottomLeftDiagonalRays";

export type BoardModes = "standard" | "crazy" | "seizure";

export type BoardEffectColors =
  | "green"
  | "pink"
  | "yellow"
  | "purple"
  | "aqua"
  | "lime"
  | "coral"
  | "teal"
  | "magenta"
  | "sky"
  | "mint"
  | "red"
  | "gold";

export const defaultImportButton = {
  pressed: false,
  seizureColor: undefined,
  classes: [],
};

export const defaultSoundEffects: SoundEffects = {
  2: {
    path: "/soundEffects/applause.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  3: {
    path: "/soundEffects/attentionWhistle.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  4: {
    path: "/soundEffects/cameraFlash.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  5: {
    path: "/soundEffects/clockTicking.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  6: {
    path: "/soundEffects/coins.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  7: {
    path: "/soundEffects/doorCreak.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  8: {
    path: "/soundEffects/glassBreak.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  9: {
    path: "/soundEffects/gunLoading.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  10: {
    path: "/soundEffects/happyWhistle.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  11: {
    path: "/soundEffects/laugh1.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  12: {
    path: "/soundEffects/laugh2.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  13: {
    path: "/soundEffects/laugh3.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  14: {
    path: "/soundEffects/laugh4.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  15: {
    path: "/soundEffects/laugh5.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  16: {
    path: "/soundEffects/laugh6.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  17: {
    path: "/soundEffects/laugh7.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  18: {
    path: "/soundEffects/laughTrack.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  19: {
    path: "/soundEffects/mouseClick.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  20: {
    path: "/soundEffects/musicBox.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  21: {
    path: "/soundEffects/police.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  22: {
    path: "/soundEffects/slideWhistle1.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  23: {
    path: "/soundEffects/slideWhistle2.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  24: {
    path: "/soundEffects/slideWhistle3.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
  25: {
    path: "/soundEffects/slideWhistle4.mp3",
    playing: false,
    pressed: false,
    seizureColor: undefined,
    classes: [],
  },
};

export const defaultSoundEffectsMetaData: SoundEffectsMetaData = {
  1: { duration: 0, timeoutOnMetaLoaded: false },
  2: { duration: 0, timeoutOnMetaLoaded: false },
  3: { duration: 0, timeoutOnMetaLoaded: false },
  4: { duration: 0, timeoutOnMetaLoaded: false },
  5: { duration: 0, timeoutOnMetaLoaded: false },
  6: { duration: 0, timeoutOnMetaLoaded: false },
  7: { duration: 0, timeoutOnMetaLoaded: false },
  8: { duration: 0, timeoutOnMetaLoaded: false },
  9: { duration: 0, timeoutOnMetaLoaded: false },
  10: { duration: 0, timeoutOnMetaLoaded: false },
  11: { duration: 0, timeoutOnMetaLoaded: false },
  12: { duration: 0, timeoutOnMetaLoaded: false },
  13: { duration: 0, timeoutOnMetaLoaded: false },
  14: { duration: 0, timeoutOnMetaLoaded: false },
  15: { duration: 0, timeoutOnMetaLoaded: false },
  16: { duration: 0, timeoutOnMetaLoaded: false },
  17: { duration: 0, timeoutOnMetaLoaded: false },
  18: { duration: 0, timeoutOnMetaLoaded: false },
  19: { duration: 0, timeoutOnMetaLoaded: false },
  20: { duration: 0, timeoutOnMetaLoaded: false },
  21: { duration: 0, timeoutOnMetaLoaded: false },
  22: { duration: 0, timeoutOnMetaLoaded: false },
  23: { duration: 0, timeoutOnMetaLoaded: false },
  24: { duration: 0, timeoutOnMetaLoaded: false },
  25: { duration: 0, timeoutOnMetaLoaded: false },
};

export const crazyBoardEffects: {
  [boardEffect in CrazyBoardEffects]: {
    sequence: number[][];
    running: boolean;
  };
} = {
  topRightDiagonal: {
    sequence: [
      [5],
      [4, 10],
      [3, 9, 15],
      [2, 8, 14, 20],
      [1, 7, 13, 19, 25],
      [6, 12, 18, 24],
      [11, 17, 23],
      [16, 22],
      [21],
      [],
    ],
    running: false,
  },
  topLeftDiagonal: {
    sequence: [
      [1],
      [2, 6],
      [11, 7, 3],
      [16, 12, 8, 4],
      [21, 17, 13, 9, 5],
      [22, 18, 14, 10],
      [23, 19, 15],
      [24, 20],
      [25],
      [],
    ],
    running: false,
  },
  bottomRightDiagonal: {
    sequence: [
      [21],
      [16, 22],
      [11, 17, 23],
      [6, 12, 18, 24],
      [1, 7, 13, 19, 25],
      [2, 8, 14, 20],
      [3, 9, 15],
      [4, 10],
      [5],
      [],
    ],
    running: false,
  },
  bottomLeftDiagonal: {
    sequence: [
      [25],
      [24, 20],
      [23, 19, 15],
      [22, 18, 14, 10],
      [21, 17, 13, 9, 5],
      [16, 12, 8, 4],
      [11, 7, 3],
      [2, 6],
      [1],
      [],
    ],
    running: false,
  },
  verticalSweep: {
    sequence: [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25],
      [],
    ],
    running: false,
  },
  horizontalSweep: {
    sequence: [
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [5, 10, 15, 20, 25],
      [],
    ],
    running: false,
  },
  reverseVerticalSweep: {
    sequence: [
      [21, 22, 23, 24, 25],
      [16, 17, 18, 19, 20],
      [11, 12, 13, 14, 15],
      [6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5],
      [],
    ],
    running: false,
  },
  reverseHorizontalSweep: {
    sequence: [
      [5, 10, 15, 20, 25],
      [4, 9, 14, 19, 24],
      [3, 8, 13, 18, 23],
      [2, 7, 12, 17, 22],
      [1, 6, 11, 16, 21],
      [],
    ],
    running: false,
  },
  scissor: {
    sequence: [
      [1, 5, 21, 25],
      [2, 4, 6, 7, 9, 10, 16, 17, 19, 20, 22, 24],
      [3, 8, 11, 12, 13, 14, 15, 18, 23],
      [3, 8, 11, 12, 13, 14, 15, 18, 23],
      [3, 8, 11, 12, 13, 14, 15, 18, 23],
      [2, 4, 6, 7, 9, 10, 16, 17, 19, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  x: {
    sequence: [
      [3, 11, 15, 23],
      [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      [1, 5, 7, 9, 13, 17, 19, 21, 25],
      [1, 5, 7, 9, 13, 17, 19, 21, 25],
      [1, 5, 7, 9, 13, 17, 19, 21, 25],
      [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      [3, 11, 15, 23],
      [],
    ],
    running: false,
  },
  pulse: {
    sequence: [
      [13],
      [8, 12, 14, 18],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [2, 4, 6, 10, 16, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  smallSpin: {
    sequence: [
      [8, 12, 14],
      [8, 14, 18],
      [12, 14, 18],
      [8, 12, 18],
      [8, 12, 14, 18],
      [8, 12, 14, 18],
      [8, 12, 14, 18],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [2, 4, 6, 10, 16, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  largeSpin: {
    sequence: [
      [3, 7, 9, 11, 15, 17, 19],
      [3, 7, 9, 11, 15, 19, 23],
      [3, 7, 9, 15, 17, 19, 23],
      [3, 9, 11, 15, 17, 19, 23],
      [7, 9, 11, 15, 17, 19, 23],
      [3, 7, 11, 15, 17, 19, 23],
      [3, 7, 9, 11, 17, 19, 23],
      [3, 7, 9, 11, 15, 17, 23],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [3, 7, 9, 11, 15, 17, 19, 23],
      [2, 4, 6, 10, 16, 20, 22, 24],
      [1, 5, 21, 25],
      [],
    ],
    running: false,
  },
  cross: {
    sequence: [[1], [7], [13], [19], [25], [5], [9], [13], [17], [21], []],
    running: false,
  },
  gravity: {
    sequence: [
      [1, 3, 5],
      [1, 3, 5, 6, 8, 10],
      [6, 8, 10, 11, 13, 15],
      [2, 4, 11, 13, 15, 16, 18, 20],
      [2, 4, 7, 9, 16, 18, 20, 21, 23, 25],
      [7, 9, 12, 14, 21, 23, 25],
      [12, 14, 17, 19],
      [17, 19, 22, 24],
      [22, 24],
      [],
    ],
    running: false,
  },
  antigravity: {
    sequence: [
      [21, 23, 25],
      [21, 23, 25, 16, 18, 20],
      [16, 18, 20, 11, 13, 15],
      [22, 24, 11, 13, 15, 6, 8, 10],
      [22, 24, 17, 19, 6, 8, 10, 1, 3, 5],
      [17, 19, 12, 14, 1, 3, 5],
      [12, 14, 7, 9],
      [7, 9, 2, 4],
      [2, 4],
      [],
    ],
    running: false,
  },
  topSmile: {
    sequence: [
      [2, 3, 4],
      [1, 5, 7, 8, 9],
      [6, 10, 12, 13, 14],
      [2, 4, 11, 15, 17, 18, 19],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [7, 9, 12, 14, 21, 25],
      [12, 14, 17, 19],
      [17, 19, 22, 24],
      [22, 24],
      [],
    ],
    running: false,
  },
  bottomSmile: {
    sequence: [
      [22, 24],
      [17, 19, 22, 24],
      [12, 14, 17, 19],
      [7, 9, 12, 14, 21, 25],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 11, 15, 17, 18, 19],
      [6, 10, 12, 13, 14],
      [1, 5, 7, 8, 9],
      [2, 3, 4],
      [],
    ],
    running: false,
  },
  leftSmile: {
    sequence: [
      [16],
      [1, 6, 17, 21],
      [2, 7, 13, 16, 17],
      [1, 6, 3, 8, 14, 16, 17, 18],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [3, 8, 5, 10, 17, 23, 24, 25],
      [4, 9, 18, 24, 25],
      [5, 10, 19, 25],
      [19],
      [],
    ],
    running: false,
  },
  rightSmile: {
    sequence: [
      [19],
      [5, 10, 19, 25],
      [4, 9, 18, 24, 25],
      [3, 8, 5, 10, 17, 23, 24, 25],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [],
      [],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [2, 4, 7, 9, 16, 22, 23, 24, 20],
      [1, 6, 3, 8, 14, 16, 17, 18],
      [2, 7, 13, 16, 17],
      [1, 6, 17, 21],
      [16],
      [],
    ],
    running: false,
  },
  spiral: {
    sequence: [
      [1],
      [2],
      [3],
      [4],
      [5],
      [10],
      [15],
      [20],
      [25],
      [24],
      [23],
      [22],
      [21],
      [16],
      [11],
      [6],
      [7],
      [8],
      [9],
      [14],
      [19],
      [18],
      [17],
      [12],
      [13],
      [],
    ],
    running: false,
  },
  vTop: {
    sequence: [
      [3],
      [2, 4, 8],
      [1, 7, 13, 9, 5],
      [6, 12, 18, 14, 10],
      [11, 17, 23, 19, 15],
      [16, 22, 24, 20],
      [21, 25],
      [],
    ],
    running: false,
  },
  vBottom: {
    sequence: [
      [23],
      [22, 24, 18],
      [21, 17, 13, 19, 25],
      [16, 12, 8, 14, 20],
      [11, 7, 3, 9, 15],
      [6, 2, 4, 10],
      [1, 5],
      [],
    ],
    running: false,
  },
  vLeft: {
    sequence: [
      [11],
      [12, 6, 16],
      [1, 7, 13, 17, 21],
      [14, 8, 2, 18, 22],
      [3, 9, 15, 19, 23],
      [4, 10, 20, 24],
      [5, 25],
      [],
    ],
    running: false,
  },
  vRight: {
    sequence: [
      [15],
      [10, 14, 20],
      [5, 9, 13, 19, 25],
      [4, 8, 12, 18, 24],
      [3, 7, 11, 17, 23],
      [2, 6, 16, 22],
      [1, 21],
      [],
    ],
    running: false,
  },
  topRightDiagonalRays: {
    sequence: [[5], [3, 9, 15], [1, 7, 13, 19, 25], [11, 17, 23], [21], []],
    running: false,
  },
  topLeftDiagonalRays: {
    sequence: [[1], [3, 7, 11], [5, 9, 13, 17, 21], [23, 19, 15], [25], []],
    running: false,
  },
  bottomRightDiagonalRays: {
    sequence: [[21], [11, 17, 23], [1, 7, 13, 19, 25], [3, 9, 15], [5], []],
    running: false,
  },
  bottomLeftDiagonalRays: {
    sequence: [[25], [23, 19, 15], [5, 9, 13, 17, 21], [3, 7, 11], [1], []],
    running: false,
  },
};

export const boardEffectColors: BoardEffectColors[] = [
  "green",
  "pink",
  "yellow",
  "purple",
  "aqua",
  "lime",
  "coral",
  "teal",
  "magenta",
  "sky",
  "mint",
  "red",
  "gold",
];
