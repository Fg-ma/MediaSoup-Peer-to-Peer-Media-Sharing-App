import * as Tone from "tone";

export type Samplers =
  | {
      category: "pianos";
      kind:
        | "default"
        | "brokenCassette"
        | "curlyElectric"
        | "dragonMagicOld"
        | "softSteinway";
      label:
        | "Default"
        | "Broken cassette"
        | "Curly electric"
        | "Dragon magic"
        | "Soft steinway";
    }
  | {
      category: "strings";
      kind: "brokenCello" | "uncleJohns5StringBanjo";
      label: "Broken cello" | "Uncle John's five string banjo";
    }
  | {
      category: "winds";
      kind:
        | "brassFrenchHorn"
        | "brassTrombone"
        | "brassTrumpet"
        | "brassTuba"
        | "classicSlideWhistle"
        | "forestFlute"
        | "oboe";
      label:
        | "Brass French horn"
        | "Brass trombone"
        | "Brass trumpet"
        | "Brass tuba"
        | "Classic slide whistle"
        | "Forest flute"
        | "Oboe";
    };

const samplers = {
  pianos: {
    default: {
      sampler: {
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
      },
      label: "Default",
    },
    brokenCassette: {
      sampler: {
        urls: {
          A0: "A0.wav",
          C1: "C1.wav",
          "D#1": "D#1.wav",
          "F#1": "F#1.wav",
          A1: "A1.wav",
          C2: "C2.wav",
          "D#2": "D#2.wav",
          "F#2": "F#2.wav",
          A2: "A2.wav",
          C3: "C3.wav",
          "D#3": "D#3.wav",
          "F#3": "F#3.wav",
          A3: "A3.wav",
          C4: "C4.wav",
          "D#4": "D#4.wav",
          "F#4": "F#4.wav",
          A4: "A4.wav",
          C5: "C5.wav",
          "D#5": "D#5.wav",
          "F#5": "F#5.wav",
          A5: "A5.wav",
          C6: "C6.wav",
          "D#6": "D#6.wav",
          "F#6": "F#6.wav",
          A6: "A6.wav",
          "A#6": "A#6.wav",
          B6: "B6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/brokenCassette/",
      },
      label: "Broken cassette",
    },
    curlyElectric: {
      sampler: {
        urls: {
          C1: "C1.wav",
          "F#1": "F#1.wav",
          C2: "C2.wav",
          "F#2": "F#2.wav",
          C3: "C3.wav",
          "F#3": "F#3.wav",
          C4: "C4.wav",
          "F#4": "F#4.wav",
          C5: "C5.wav",
          "F#5": "F#5.wav",
          B5: "B5.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/curlyElectric/",
      },
      label: "Curly electric",
    },
    dragonMagicOld: {
      sampler: {
        urls: {
          C1: "C1.wav",
          G1: "G1.wav",
          C2: "C2.wav",
          G2: "G2.wav",
          C3: "C3.wav",
          G3: "G3.wav",
          C4: "C4.wav",
          G4: "G4.wav",
          C5: "C5.wav",
          G5: "G5.wav",
          C6: "C6.wav",
          G6: "G6.wav",
          C7: "C7.wav",
          G7: "G7.wav",
          C8: "C8.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/dragonMagicOld/",
      },
      label: "Dragon magic",
    },
    softSteinway: {
      sampler: {
        urls: {
          C0: "C0.wav",
          G0: "G0.wav",
          D1: "D1.wav",
          A1: "A1.wav",
          E2: "E2.wav",
          B2: "B2.wav",
          "F#3": "F#3.wav",
          "C#4": "C#4.wav",
          "G#4": "G#4.wav",
          "D#5": "D#5.wav",
          "A#5": "A#5.wav",
          F6: "F6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/softSteinway/",
      },
      label: "Soft Steinway",
    },
  },
  strings: {
    acousticGuitar: {
      sampler: {
        urls: {
          E1: "E1.wav",
          "F#1": "F#1.wav",
          "G#1": "G#1.wav",
          "A#1": "A#1.wav",
          C2: "C2.wav",
          D2: "D2.wav",
          E2: "E2.wav",
          "F#2": "F#2.wav",
          "G#2": "G#2.wav",
          "A#2": "A#2.wav",
          C3: "C3.wav",
          D3: "D3.wav",
          E3: "E3.wav",
          "F#3": "F#3.wav",
          "G#3": "G#3.wav",
          "A#3": "A#3.wav",
          C4: "C4.wav",
          D4: "D4.wav",
          E4: "E4.wav",
          "F#4": "F#4.wav",
          "G#4": "G#4.wav",
          "A#4": "A#4.wav",
          C5: "C5.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/acousticGuitar/",
      },
      label: "Acoustic guitar",
    },
    AXAFifthsBouncedGuitar: {
      sampler: {
        urls: {
          B1: "B1.wav",
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
          F2: "F2.wav",
          "F#2": "F#2.wav",
          G2: "G2.wav",
          "G#2": "G#2.wav",
          A2: "A2.wav",
          "A#2": "A#2.wav",
          B2: "B2.wav",
          C3: "C3.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          G3: "G3.wav",
          "G#3": "G#3.wav",
          A3: "A3.wav",
          "A#3": "A#3.wav",
          B3: "B3.wav",
          C4: "C4.wav",
          "C#4": "C#4.wav",
          D4: "D4.wav",
          "D#4": "D#4.wav",
          E4: "E4.wav",
          F4: "F4.wav",
          "F#4": "F#4.wav",
          G4: "G4.wav",
          "G#4": "G#4.wav",
          A4: "A4.wav",
          "A#4": "A#4.wav",
          B4: "B4.wav",
          C5: "C5.wav",
          "C#5": "C#5.wav",
          D5: "D5.wav",
          "D#5": "D#5.wav",
          E5: "E5.wav",
          F5: "F5.wav",
          "F#5": "F#5.wav",
          G5: "G5.wav",
          "G#5": "G#5.wav",
          A5: "A5.wav",
          "A#5": "A#5.wav",
          B5: "B5.wav",
          C6: "C6.wav",
          "C#6": "C#6.wav",
          D6: "D6.wav",
          "D#6": "D#6.wav",
          E6: "E6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/AXAFifthsBouncedGuitar/",
      },
      label: "AXA fifths bounced guitar",
    },
    AXAVoodooVibeGuitar: {
      sampler: {
        urls: {
          B1: "B1.wav",
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
          F2: "F2.wav",
          "F#2": "F#2.wav",
          G2: "G2.wav",
          "G#2": "G#2.wav",
          A2: "A2.wav",
          "A#2": "A#2.wav",
          B2: "B2.wav",
          C3: "C3.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          G3: "G3.wav",
          "G#3": "G#3.wav",
          A3: "A3.wav",
          "A#3": "A#3.wav",
          B3: "B3.wav",
          C4: "C4.wav",
          "C#4": "C#4.wav",
          D4: "D4.wav",
          "D#4": "D#4.wav",
          E4: "E4.wav",
          F4: "F4.wav",
          "F#4": "F#4.wav",
          G4: "G4.wav",
          "G#4": "G#4.wav",
          A4: "A4.wav",
          "A#4": "A#4.wav",
          B4: "B4.wav",
          C5: "C5.wav",
          "C#5": "C#5.wav",
          D5: "D5.wav",
          "D#5": "D#5.wav",
          E5: "E5.wav",
          F5: "F5.wav",
          "F#5": "F#5.wav",
          G5: "G5.wav",
          "G#5": "G#5.wav",
          A5: "A5.wav",
          "A#5": "A#5.wav",
          B5: "B5.wav",
          C6: "C6.wav",
          "C#6": "C#6.wav",
          D6: "D6.wav",
          "D#6": "D#6.wav",
          E6: "E61.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/AXAVoodooVibeGuitar/",
      },
      label: "AXA voodoo vibe guitar",
    },
    brokenCello: {
      sampler: {
        urls: {
          "C#1": "C#1.wav",
          E1: "E1.wav",
          G1: "G1.wav",
          "A#1": "A#1.wav",
          "C#2": "C#2.wav",
          E2: "E2.wav",
          G2: "G2.wav",
          "A#2": "A#2.wav",
          E3: "E3.wav",
          G3: "G3.wav",
          "A#3": "A#3.wav",
          "C#3": "C#3.wav",
          "C#4": "C#4.wav",
          E4: "E4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/brokenCello/",
      },
      label: "Broken cello",
    },
    clankyAmpMetalGuitar: {
      sampler: {
        urls: {
          C0: "C0.wav",
          "C#0": "C#0.wav",
          D0: "D0.wav",
          "D#0": "D#0.wav",
          E0: "E0.wav",
          F0: "F0.wav",
          "F#0": "F#0.wav",
          G0: "G0.wav",
          "G#0": "G#0.wav",
          A0: "A0.wav",
          "A#0": "A#0.wav",
          B0: "B0.wav",
          C1: "C1.wav",
          "C#1": "C#1.wav",
          D1: "D1.wav",
          "D#1": "D#1.wav",
          E1: "E1.wav",
          F1: "F1.wav",
          "F#1": "F#1.wav",
          G1: "G1.wav",
          "G#1": "G#1.wav",
          A1: "A1.wav",
          "A#1": "A#1.wav",
          B1: "B1.wav",
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/clankyAmpMetalGuitar/",
      },
      label: "Clanky amp metal guitar",
    },
    clankyMetalBassGuitar: {
      sampler: {
        urls: {
          C0: "C0.wav",
          "C#0": "C#0.wav",
          D0: "D0.wav",
          "D#0": "D#0.wav",
          E0: "E0.wav",
          F0: "F0.wav",
          "F#0": "F#0.wav",
          G0: "G0.wav",
          "G#0": "G#0.wav",
          A0: "A0.wav",
          "A#0": "A#0.wav",
          B0: "B0.wav",
          C1: "C1.wav",
          "C#1": "C#1.wav",
          D1: "D1.wav",
          "D#1": "D#1.wav",
          E1: "E1.wav",
          F1: "F1.wav",
          "F#1": "F#1.wav",
          G1: "G1.wav",
          "G#1": "G#1.wav",
          A1: "A1.wav",
          "A#1": "A#1.wav",
          B1: "B1.wav",
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/clankyMetalBassGuitar/",
      },
      label: "Clanky metal bass guitar",
    },
    ferrumIronGuitar: {
      sampler: {
        urls: {
          C3: "C3.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          G3: "G3.wav",
          "G#3": "G#3.wav",
          A3: "A3.wav",
          "A#3": "A#3.wav",
          B3: "B3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/ferrumIronGuitar/",
      },
      label: "Ferrum iron guitar",
    },
    freshGuitar: {
      sampler: {
        urls: {
          C2: "C#3.wav",
          E2: "C#3.wav",
          C3: "C#3.wav",
          E3: "C#3.wav",
          "G#3": "C#3.wav",
          C4: "C#3.wav",
          E4: "C#3.wav",
          "G#4": "C#3.wav",
          E5: "C#3.wav",
          "G#5": "C#3.wav",
          "G#6": "C#3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/freshGuitar/",
      },
      label: "Fresh guitar",
    },
    MexicanGuitarron: {
      sampler: {
        urls: {
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
          "G#3": "C#3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/MexicanGuitarron/",
      },
      label: "Mexican guitarron",
    },
    uncleJohns5StringBanjo: {
      sampler: {
        urls: {
          C3: "C3.wav",
          D3: "D3.wav",
          G3: "G3.wav",
          B3: "B3.wav",
          D4: "D4.wav",
          G4: "G4.wav",
          D5: "D5.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/uncleJohns5StringBanjo/",
      },
      label: "Uncle John's five string banjo",
    },
  },
  winds: {
    brassFrenchHorn: {
      sampler: {
        urls: {
          "A#1": "A#1.wav",
          B1: "B1.wav",
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
          F2: "F2.wav",
          "F#2": "F#2.wav",
          G2: "G2.wav",
          "G#2": "G#2.wav",
          A2: "A2.wav",
          "A#2": "A#2.wav",
          B2: "B2.wav",
          C3: "C3.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          G3: "G3.wav",
          "G#3": "G#3.wav",
          A3: "A3.wav",
          "A#3": "A#3.wav",
          B3: "B3.wav",
          C4: "C4.wav",
          "C#4": "C#4.wav",
          D4: "D4.wav",
          "D#4": "D#4.wav",
          E4: "E4.wav",
          F4: "F4.wav",
          "F#4": "F#4.wav",
          G4: "G4.wav",
          "G#4": "G#4.wav",
          A4: "A4.wav",
          "A#4": "A#4.wav",
          B4: "B4.wav",
          C5: "C5.wav",
          "C#5": "C#5.wav",
          D5: "D5.wav",
          "D#5": "D#5.wav",
          E5: "E5.wav",
          F5: "F5.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/brassFrenchHorn/",
      },
      label: "Brass French horn",
    },
    brassTrombone: {
      sampler: {
        urls: {
          A1: "A1.wav",
          "A#1": "A#1.wav",
          B1: "B1.wav",
          F1: "F1.wav",
          "F#1": "F#1.wav",
          G1: "G1.wav",
          "G#1": "G#1.wav",
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
          F2: "F2.wav",
          "F#2": "F#2.wav",
          G2: "G2.wav",
          "G#2": "G#2.wav",
          A2: "A2.wav",
          "A#2": "A#2.wav",
          B2: "B2.wav",
          C3: "C3.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          G3: "G3.wav",
          "G#3": "G#3.wav",
          A3: "A3.wav",
          "A#3": "A#3.wav",
          B3: "B3.wav",
          C4: "C4.wav",
          "C#4": "C#4.wav",
          D4: "D4.wav",
          "D#4": "D#4.wav",
          E4: "E4.wav",
          F4: "F4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/brassTrombone/",
      },
      label: "Brass trombone",
    },
    brassTrumpet: {
      sampler: {
        urls: {
          A3: "A3.wav",
          "A#3": "A#3.wav",
          B3: "B3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          G3: "G3.wav",
          "G#3": "G#3.wav",
          C4: "C4.wav",
          "C#4": "C#4.wav",
          D4: "D4.wav",
          "D#4": "D#4.wav",
          E4: "E4.wav",
          F4: "F4.wav",
          "F#4": "F#4.wav",
          G4: "G4.wav",
          "G#4": "G#4.wav",
          A4: "A4.wav",
          "A#4": "A#4.wav",
          B4: "B4.wav",
          C5: "C5.wav",
          "C#5": "C#5.wav",
          D5: "D5.wav",
          "D#5": "D#5.wav",
          E5: "E5.wav",
          F5: "F5.wav",
          "F#5": "F#5.wav",
          G5: "G5.wav",
          "G#5": "G#5.wav",
          A5: "A5.wav",
          "A#5": "A#5.wav",
          B5: "B5.wav",
          C6: "C6.wav",
          "C#6": "C#6.wav",
          D6: "D6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/brassTrumpet/",
      },
      label: "Brass trumpet",
    },
    brassTuba: {
      sampler: {
        urls: {
          D1: "D1.wav",
          "D#1": "D#1.wav",
          E1: "E1.wav",
          "F#1": "F#1.wav",
          B1: "B1.wav",
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
          F2: "F2.wav",
          "G#2": "G#2.wav",
          A2: "A2.wav",
          "A#2": "A#2.wav",
          B2: "B2.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          "G#3": "G#3.wav",
          A3: "A3.wav",
          "A#3": "A#3.wav",
          B3: "B3.wav",
          C4: "C4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/brassTuba/",
      },
      label: "Brass tuba",
    },
    classicSlideWhistle: {
      sampler: {
        urls: {
          G3: "G3.wav",
          A3: "A3.wav",
          B3: "B3.wav",
          C4: "C4.wav",
          D4: "D4.wav",
          E4: "E4.wav",
          G4: "G4.wav",
          A4: "A4.wav",
          C5: "C5.wav",
          F5: "F5.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/classicSlideWhistle/",
      },
      label: "Classic slide whistle",
    },
    forestFlute: {
      sampler: {
        urls: {
          E4: "E4.wav",
          "F#4": "F#4.wav",
          "G#4": "G#4.wav",
          "A#4": "A#4.wav",
          B4: "B4.wav",
          D5: "D5.wav",
          D6: "D6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/forestFlute/",
      },
      label: "Forest flute",
    },
    oboe: {
      sampler: {
        urls: {
          C4: "C4.wav",
          "C#4": "C#4.wav",
          D4: "D4.wav",
          "D#4": "D#4.wav",
          E4: "E4.wav",
          F4: "F4.wav",
          "F#4": "F#4.wav",
          G4: "G4.wav",
          "G#4": "G#4.wav",
          A4: "A4.wav",
          "A#4": "A#4.wav",
          B4: "B4.wav",
          C5: "C5.wav",
          "C#5": "C#5.wav",
          D5: "D5.wav",
          "D#5": "D#5.wav",
          E5: "E5.wav",
          F5: "F5.wav",
          "F#5": "F#5.wav",
          G5: "G5.wav",
          "G#5": "G#5.wav",
          A5: "A5.wav",
          "A#5": "A#5.wav",
          B5: "B5.wav",
          C6: "C6.wav",
          "C#6": "C#6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/oboe/",
      },
      label: "Oboe",
    },
  },
};

class FgSampler {
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  private sampler: Tone.Sampler | undefined;

  private playingNotes: Set<string> = new Set();

  private volumeNode: Tone.Volume;

  constructor(mediaStreamDestination: MediaStreamAudioDestinationNode) {
    this.mediaStreamDestination = mediaStreamDestination;

    this.volumeNode = new Tone.Volume(0); // 0 dB by default

    this.sampler = new Tone.Sampler(samplers.pianos.default.sampler);

    this.sampler.connect(this.volumeNode);

    this.volumeNode.connect(this.mediaStreamDestination);
  }

  swapSampler = (
    sampler: { category: string; kind: string },
    increment?: number
  ): Samplers => {
    // Disconnect and dispose of the current sampler if it exists
    if (this.sampler) {
      this.sampler.disconnect();
      this.sampler.dispose();
    }

    if (increment === undefined) {
      this.sampler = new Tone.Sampler(
        // @ts-ignore
        samplers[sampler.category][sampler.kind].sampler
      );
      this.sampler.connect(this.volumeNode);

      return {
        category: sampler.category,
        kind: sampler.kind,
        // @ts-ignore
        label: samplers[sampler.category][sampler.kind].label,
      } as Samplers;
    } else {
      // Get an array of sampler kinds in the category
      // @ts-ignore
      const kinds = Object.keys(samplers[sampler.category]);

      // Find the index of the current kind
      const currentIndex = kinds.indexOf(sampler.kind);
      if (currentIndex === -1) throw new Error("Invalid sampler kind");

      // Calculate the new index, wrapping around if necessary
      const newIndex = (currentIndex + increment + kinds.length) % kinds.length;
      const newKind = kinds[newIndex];

      this.sampler = new Tone.Sampler(
        // @ts-ignore
        samplers[sampler.category][newKind].sampler
      );
      this.sampler.connect(this.volumeNode);

      return {
        // @ts-ignore
        category: sampler.category,
        kind: newKind as any,
        // @ts-ignore
        label: samplers[sampler.category][newKind].label,
      };
    }
  };

  // Trigger a note when a key is pressed
  playNote = (note: string, isPress: boolean) => {
    if (isPress) {
      if (!this.playingNotes.has(note)) {
        this.sampler?.triggerAttack(note);
        this.playingNotes.add(note);
      }
    } else {
      if (this.playingNotes.has(note)) {
        this.sampler?.triggerRelease(note);
        this.playingNotes.delete(note);
      }
    }
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };
}

export default FgSampler;
