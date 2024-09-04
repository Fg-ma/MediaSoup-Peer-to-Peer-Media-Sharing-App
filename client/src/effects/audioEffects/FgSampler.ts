import * as Tone from "tone";
import { AudioMixEffectsType, MixEffectsOptionsType } from "./AudioEffects";

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
      playOnlyDefined: boolean;
      definedNotes: string[];
    }
  | {
      category: "strings";
      kind: "brokenCello" | "uncleJohns5StringBanjo";
      label: "Broken cello" | "Uncle John's five string banjo";
      playOnlyDefined: boolean;
      definedNotes: string[];
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
      playOnlyDefined: boolean;
      definedNotes: string[];
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
      playOnlyDefined: false,
    },
    acPiano1: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/acPiano1/",
      },
      label: "AC piano 1",
      playOnlyDefined: false,
    },
    acPiano2: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/acPiano2/",
      },
      label: "AC piano 2",
      playOnlyDefined: false,
    },
    bellPiano: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/bellPiano/",
      },
      label: "Bell piano",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    claviPiano: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/claviPiano/",
      },
      label: "Clavi Piano",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    electricPiano1: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/electricPiano1/",
      },
      label: "Electric piano 1",
      playOnlyDefined: false,
    },
    electricPiano2: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/electricPiano2/",
      },
      label: "Electric piano 2",
      playOnlyDefined: false,
    },
    electricPiano3: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/electricPiano3/",
      },
      label: "Electric piano 3",
      playOnlyDefined: false,
    },
    electricPiano4: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/electricPiano4/",
      },
      label: "Electric piano 4",
      playOnlyDefined: false,
    },
    electricPiano5: {
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
          "F#4": "F#4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/electricPiano5/",
      },
      label: "Electric piano 5",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    toyPiano: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/pianos/toyPiano/",
      },
      label: "Toy piano",
      playOnlyDefined: false,
    },
  },
  strings: {
    acBass: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/acBass/",
      },
      label: "AC bass",
      playOnlyDefined: false,
    },
    acGuitar: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/acGuitar/",
      },
      label: "AC guitar",
      playOnlyDefined: false,
    },
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
      playOnlyDefined: false,
    },
    anaBass: {
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
          A3: "A3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/anaBass/",
      },
      label: "Ana bass",
      playOnlyDefined: false,
    },
    AXAFifthsBounceGuitar: {
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
        baseUrl: "/audioSamples/strings/AXAFifthsBounceGuitar/",
      },
      label: "AXA fifths bounce guitar",
      playOnlyDefined: false,
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
          E6: "E6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/AXAVoodooVibeGuitar/",
      },
      label: "AXA voodoo vibe guitar",
      playOnlyDefined: false,
    },
    beyondBowCello: {
      sampler: {
        urls: {
          C1: "C1.wav",
          D1: "D1.wav",
          G1: "G1.wav",
          A1: "A1.wav",
          C2: "C2.wav",
          D2: "D2.wav",
          G2: "G2.wav",
          A2: "A2.wav",
          C3: "C3.wav",
          D3: "D3.wav",
          G3: "G3.wav",
          C4: "C4.wav",
          D4: "D4.wav",
          G4: "G4.wav",
          A4: "A4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/beyondBowCello/",
      },
      label: "Beyond bow cello",
      playOnlyDefined: false,
    },
    brightGuitar: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/brightGuitar/",
      },
      label: "Bright guitar",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    cello: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/cello/",
      },
      label: "Cello",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    electricBass1: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/electricBass1/",
      },
      label: "Electric bass 1",
      playOnlyDefined: false,
    },
    electricBass2: {
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
          "F#3": "F#3.wav",
          C4: "C4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/electricBass2/",
      },
      label: "Electric bass 2",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    freshGuitar: {
      sampler: {
        urls: {
          C2: "C2.wav",
          E2: "E2.wav",
          C3: "C3.wav",
          E3: "E3.wav",
          "G#3": "G#3.wav",
          C4: "C4.wav",
          E4: "E4.wav",
          "G#4": "G#4.wav",
          E5: "E5.wav",
          "G#5": "G#5.wav",
          "G#6": "G#6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/freshGuitar/",
      },
      label: "Fresh guitar",
      playOnlyDefined: false,
    },
    fretlessGuitar: {
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
          A4: "A4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/fretlessGuitar/",
      },
      label: "Fretless guitar",
      playOnlyDefined: false,
    },
    fuzzGuitar: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/fuzzGuitar/",
      },
      label: "Fuzz guitar",
      playOnlyDefined: false,
    },
    jarreBass: {
      sampler: {
        urls: {
          A0: "A0.wav",
          A1: "A1.wav",
          A2: "A2.wav",
          A3: "A3.wav",
          "D#1": "D#1.wav",
          "D#2": "D#2.wav",
          "D#3": "D#3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/jarreBass/",
      },
      label: "Jarre bass",
      playOnlyDefined: false,
    },
    longFMBass: {
      sampler: {
        urls: {
          G0: "G0.wav",
          C1: "C1.wav",
          "D#1": "D#1.wav",
          "F#1": "F#1.wav",
          A1: "A1.wav",
          C2: "C2.wav",
          "D#2": "D#2.wav",
          "F#2": "F#2.wav",
          A2: "A2.wav",
          C3: "C3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/longFMBass/",
      },
      label: "Long FM bass",
      playOnlyDefined: false,
    },
    MexicanGuitarron: {
      sampler: {
        urls: {
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
          F2: "F2.wav",
          "F#2": "F#2.wav",
          G2: "G2.wav",
          "G#2": "G#2.wav",
          A2: "A2.wav",
          "A#2": "A#2.wav",
          B2: "B2.wav",
          "B#2": "B#2.wav",
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
        baseUrl: "/audioSamples/strings/MexicanGuitarron/",
      },
      label: "Mexican guitarron",
      playOnlyDefined: false,
    },
    moogBass: {
      sampler: {
        urls: {
          C1: "C1.wav",
          "F#1": "F#1.wav",
          C2: "C2.wav",
          "F#2": "F#2.wav",
          C3: "C3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/moogBass/",
      },
      label: "Moog bass",
      playOnlyDefined: false,
    },
    mutedGuitar: {
      sampler: {
        urls: {
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
          A4: "A4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/mutedGuitar/",
      },
      label: "Muted guitar",
      playOnlyDefined: false,
    },
    RJSGuitar: {
      sampler: {
        urls: {
          A2: "A2.wav",
          A3: "A3.wav",
          C3: "C3.wav",
          D3: "D3.wav",
          E2: "E2.wav",
          E3: "E3.wav",
          G2: "G2.wav",
          G3: "G3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/RJSGuitar/",
      },
      label: "RJS guitar",
      playOnlyDefined: false,
    },
    shortFMBass: {
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
          A4: "A4.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/strings/shortFMBass/",
      },
      label: "Short FM bass",
      playOnlyDefined: false,
    },
    strings1: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/strings1/",
      },
      label: "Strings 1",
      playOnlyDefined: false,
    },
    strings2: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/strings2/",
      },
      label: "Strings 2",
      playOnlyDefined: false,
    },
    sweepBass: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/sweepBass/",
      },
      label: "Sweep bass",
      playOnlyDefined: false,
    },
    synthBass: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/synthBass/",
      },
      label: "Synth bass",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    violin: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/strings/violin/",
      },
      label: "Violin",
      playOnlyDefined: false,
    },
  },
  winds: {
    bassFrenchHorn: {
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
      label: "Bass French horn",
      playOnlyDefined: false,
    },
    bassTrombone: {
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
      label: "Bass trombone",
      playOnlyDefined: false,
    },
    bassTrumpet: {
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
      label: "Bass trumpet",
      playOnlyDefined: false,
    },
    bassTuba: {
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
      label: "Bass tuba",
      playOnlyDefined: false,
    },
    clarinet: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/clarinet/",
      },
      label: "Clarinet",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    flugelhorn: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/flugelhorn/",
      },
      label: "Flugelhorn",
      playOnlyDefined: false,
    },
    flute: {
      sampler: {
        urls: {
          C2: "C2.wav",
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/flute/",
      },
      label: "Flute",
      playOnlyDefined: false,
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
      playOnlyDefined: false,
    },
    hoverFlute: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/hoverFlute/",
      },
      label: "Hover flute",
      playOnlyDefined: true,
    },
    oboe1: {
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
        baseUrl: "/audioSamples/winds/oboe1/",
      },
      label: "Oboe 1",
      playOnlyDefined: false,
    },
    oboe2: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/oboe2/",
      },
      label: "Oboe 2",
      playOnlyDefined: false,
    },
    recorder: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/recorder/",
      },
      label: "Recorder",
      playOnlyDefined: false,
    },
    saxophone: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/saxophone/",
      },
      label: "Saxophone",
      playOnlyDefined: false,
    },
    tenorSaxophone: {
      sampler: {
        urls: {
          A3: "A3.wav",
          "A#3": "A#3.wav",
          C4: "C4.wav",
          D4: "D4.wav",
          "D#4": "D#4.wav",
          F4: "F4.wav",
          G4: "G4.wav",
          A4: "A4.wav",
          "A#4": "A#4.wav",
          C5: "C5.wav",
          D5: "D5.wav",
          "D#5": "D#5.wav",
          F5: "F5.wav",
          G5: "G5.wav",
          A5: "A5.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/winds/tenorSaxophone/",
      },
      label: "Tenor saxophone",
      playOnlyDefined: false,
    },
    whistle: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/winds/whistle/",
      },
      label: "Whistle",
      playOnlyDefined: false,
    },
  },
  drums: {
    brokenSplashCymbalGong: {
      sampler: {
        urls: {
          "C#3": "C#3.wav",
          C3: "C3.wav",
          "D#3": "D#3.wav",
          D3: "D3.wav",
          E3: "E3.wav",
          "F#3": "F#3.wav",
          F3: "F3.wav",
          G3: "G3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/brokenSplashCymbalGong/",
      },
      label: "Broken splash cymbal gong",
      playOnlyDefined: true,
    },
    claveFrog: {
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
          F6: "F6.wav",
          "F#6": "F#6.wav",
          G6: "G6.wav",
          "G#6": "G#6.wav",
          A6: "A6.wav",
          "A#6": "A#6.wav",
          B6: "B6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/claveFrog/",
      },
      label: "Clave frog",
      playOnlyDefined: true,
    },
    garageSaleDrumKit: {
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
          F6: "F6.wav",
          "F#6": "F#6.wav",
          G6: "G6.wav",
          "G#6": "G#6.wav",
          A6: "A6.wav",
          "A#6": "A#6.wav",
          B6: "B6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/garageSaleDrumKit/",
      },
      label: "Garage sale drum kit",
      playOnlyDefined: true,
    },
    handBells: {
      sampler: {
        urls: {
          C1: "C1.wav",
          D1: "D1.wav",
          E1: "E1.wav",
          F1: "F1.wav",
          "F#1": "F#1.wav",
          G1: "G1.wav",
          "G#1": "G#1.wav",
          A1: "A1.wav",
          B1: "B1.wav",
          C2: "C2.wav",
          D2: "D2.wav",
          E2: "E2.wav",
          F2: "F2.wav",
          "F#2": "F#2.wav",
          G2: "G2.wav",
          A2: "A2.wav",
          B2: "B2.wav",
          C3: "C3.wav",
          D3: "D3.wav",
          E3: "E3.wav",
          F3: "F3.wav",
          "F#3": "F#3.wav",
          G3: "G3.wav",
          "G#3": "G#3.wav",
          A3: "A3.wav",
          B3: "B3.wav",
          C4: "C4.wav",
          D4: "D4.wav",
          E4: "E4.wav",
          F4: "F4.wav",
          "F#4": "F#4.wav",
          G4: "G4.wav",
          A4: "A4.wav",
          B4: "B4.wav",
          C5: "C5.wav",
          D5: "D5.wav",
          E5: "E5.wav",
          F5: "F5.wav",
          "F#5": "F#5.wav",
          G5: "G5.wav",
          "G#5": "G#5.wav",
          A5: "A5.wav",
          B5: "B5.wav",
          C6: "C6.wav",
          D6: "D6.wav",
          E6: "E6.wav",
          F6: "F6.wav",
          "F#6": "F#6.wav",
          G6: "G6.wav",
          A6: "A6.wav",
          B6: "B6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/handBells/",
      },
      label: "Hand bells",
      playOnlyDefined: true,
    },
    JonsCajons: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/JonsCajons/",
      },
      label: "Jon's cajons",
      playOnlyDefined: true,
    },
    kitchenDrumKit: {
      sampler: {
        urls: {
          C2: "C2.wav",
          "C#2": "C#2.wav",
          D2: "D2.wav",
          "D#2": "D#2.wav",
          E2: "E2.wav",
          "F#2": "F#2.wav",
          "G#2": "G#2.wav",
          C3: "C3.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
          "F#3": "F#3.wav",
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
          C5: "C5.wav",
          "C#5": "C#5.wav",
          D5: "D5.wav",
          "D#5": "D#5.wav",
          E5: "E5.wav",
          F5: "F5.wav",
          "F#5": "F#5.wav",
          G5: "G5.wav",
          "G#5": "G#5.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/kitchenDrumKit/",
      },
      label: "Kitchen drum kit",
      playOnlyDefined: true,
    },
    metallophon: {
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
        baseUrl: "/audioSamples/drums/metallophon/",
      },
      label: "Metallophon",
      playOnlyDefined: true,
    },
    slitLogDrum: {
      sampler: {
        urls: {
          "C#3": "C#3.wav",
          C3: "C3.wav",
          "D#3": "D#3.wav",
          D3: "D3.wav",
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
        baseUrl: "/audioSamples/drums/slitLogDrum/",
      },
      label: "Slit log drum",
      playOnlyDefined: true,
    },
    solarWinds: {
      sampler: {
        urls: {
          C3: "C3.wav",
          "C#3": "C#3.wav",
          D3: "D3.wav",
          "D#3": "D#3.wav",
          E3: "E3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/solarWinds/",
      },
      label: "Solar winds",
      playOnlyDefined: true,
    },
    tinCanDrums: {
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
          F6: "F6.wav",
          "F#6": "F#6.wav",
          G6: "G6.wav",
          "G#6": "G#6.wav",
          A6: "A6.wav",
          "A#6": "A#6.wav",
          B6: "B6.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/tinCanDrums/",
      },
      label: "Tin can drums",
      playOnlyDefined: true,
    },
  },
  synths: {
    leadSynth1: {
      sampler: {
        urls: {
          "D#1": "D#1.wav",
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/leadSynth1/",
      },
      label: "Lead synth 1",
      playOnlyDefined: true,
    },
    leadSynth2: {
      sampler: {
        urls: {
          C1: "C1.wav",
          "D#1": "D#1.wav",
          "F#1": "F#2.wav",
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/leadSynth2/",
      },
      label: "Lead synth 2",
      playOnlyDefined: true,
    },
    leadSynth3: {
      sampler: {
        urls: {
          A1: "A1.wav",
          "D#2": "D#2.wav",
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/leadSynth3/",
      },
      label: "Lead synth 3",
      playOnlyDefined: true,
    },
    leadSynth4: {
      sampler: {
        urls: {
          C1: "C1.wav",
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/leadSynth4/",
      },
      label: "Lead synth 4",
      playOnlyDefined: true,
    },
    leadSynth5: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/leadSynth5/",
      },
      label: "Lead synth 5",
      playOnlyDefined: true,
    },
    leadSynth6: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/leadSynth6/",
      },
      label: "Lead synth 6",
      playOnlyDefined: true,
    },
    leadSynth7: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/leadSynth7/",
      },
      label: "Lead synth 7",
      playOnlyDefined: true,
    },
    padSynth1: {
      sampler: {
        urls: {
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/padSynth1/",
      },
      label: "Pad synth 1",
      playOnlyDefined: true,
    },
    padSynth2: {
      sampler: {
        urls: {
          C1: "C1.wav",
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
        },
        release: 1,
        baseUrl: "/audioSamples/drums/padSynth2/",
      },
      label: "Pad synth 2",
      playOnlyDefined: true,
    },
  },
  organs: {
    bottleOrgan: {
      sampler: {
        urls: {
          "C#2": "C#2.wav",
          "C#3": "C#3.wav",
          C2: "C2.wav",
          C3: "C3.wav",
          "D#2": "D#2.wav",
          "D#3": "D#3.wav",
          D2: "D2.wav",
          D3: "D3.wav",
          E3: "E3.wav",
          "F#3": "F#3.wav",
          F3: "F3.wav",
          G3: "G3.wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/bottleOrgan/",
      },
      label: "Bottle organ",
      playOnlyDefined: true,
    },
    cassetteTapeOrgan: {
      sampler: {
        urls: {
          "": ".wav",
        },
        release: 1,
        baseUrl: "/audioSamples/drums/cassetteTapeOrgan/",
      },
      label: "Cassette tape organ",
      playOnlyDefined: false,
    },
  },
  misc: {},
};

class FgSampler {
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  private sampler: Tone.Sampler | undefined;
  private playOnlyDefined: boolean;
  private definedNotes: string[] = [];

  private effectChain: Tone.Gain;
  private effects: any[] = [];

  private playingNotes: Set<string> = new Set();

  private volumeNode: Tone.Volume;
  private autoFilter: Tone.AutoFilter | undefined;
  private autoPanner: Tone.AutoPanner | undefined;
  private autoWah: Tone.AutoWah | undefined;
  private bitCrusher: Tone.BitCrusher | undefined;
  private chebyshev: Tone.Chebyshev | undefined;
  private chorus: Tone.Chorus | undefined;
  private distortion: Tone.Distortion | undefined;
  private eq3: Tone.EQ3 | undefined;
  private feedbackDelay: Tone.FeedbackDelay | undefined;
  private freeverb: Tone.Freeverb | undefined;
  private JCReverb: Tone.JCReverb | undefined;
  private phaser: Tone.Phaser | undefined;
  private pingPongDelay: Tone.PingPongDelay | undefined;
  private pitchShift: Tone.PitchShift | undefined;
  private reverb: Tone.Reverb | undefined;
  private stereoWidener: Tone.StereoWidener | undefined;
  private tremolo: Tone.Tremolo | undefined;
  private vibrato: Tone.Vibrato | undefined;

  private effectUpdaters: {
    [key in AudioMixEffectsType]: (
      updates: { option: MixEffectsOptionsType; value: number }[]
    ) => void;
  } = {
    autoFilter: (updates) => {
      if (!this.autoFilter) {
        this.applyAutoFilter();
      }
      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.autoFilter!.frequency.value = update.value;
            break;
          case "baseFrequency":
            this.autoFilter!.baseFrequency = update.value;
            break;
          case "octaves":
            this.autoFilter!.octaves = update.value;
            break;
          default:
            break;
        }
      });
    },
    autoPanner: (updates) => {
      if (!this.autoPanner) {
        this.applyAutoPanner();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.autoPanner!.frequency.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    autoWah: (updates) => {
      if (!this.autoWah) {
        this.applyAutoWah();
      }

      updates.map((update) => {
        switch (update.option) {
          case "baseFrequency":
            this.autoWah!.baseFrequency = update.value;
            break;
          case "octaves":
            this.autoWah!.octaves = update.value;
            break;
          case "sensitivity":
            this.autoWah!.sensitivity = update.value;
            break;
          default:
            break;
        }
      });
    },
    bitCrusher: (updates) => {
      if (!this.bitCrusher) {
        this.applyBitCrusher();
      }

      updates.map((update) => {
        switch (update.option) {
          case "bits":
            this.bitCrusher!.bits.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    chebyshev: (updates) => {
      if (!this.chebyshev) {
        this.applyChebyshev();
      }

      updates.map((update) => {
        switch (update.option) {
          case "order":
            this.chebyshev!.order = update.value;
            break;
          default:
            break;
        }
      });
    },
    chorus: (updates) => {
      if (!this.chorus) {
        this.applyChorus();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.chorus!.frequency.value = update.value;
            break;
          case "delayTime":
            this.chorus!.delayTime = update.value;
            break;
          case "depth":
            this.chorus!.depth = update.value;
            break;
        }
      });
    },
    distortion: (updates) => {
      if (!this.distortion) {
        this.applyDistortion();
      }

      updates.map((update) => {
        switch (update.option) {
          case "distortion":
            this.distortion!.distortion = update.value;
            break;
          case "feedback":
            this.distortion!.oversample = `${update.value <= 2 ? 2 : 4}x`;
            break;
        }
      });
    },
    EQ: (updates) => {
      if (!this.eq3) {
        this.applyEQ();
      }

      updates.map((update) => {
        switch (update.option) {
          case "low":
            this.eq3!.low.value = update.value;
            break;
          case "mid":
            this.eq3!.mid.value = update.value;
            break;
          case "high":
            this.eq3!.high.value = update.value;
            break;
        }
      });
    },
    feedbackDelay: (updates) => {
      if (!this.feedbackDelay) {
        this.applyFeedbackDelay();
      }

      updates.map((update) => {
        switch (update.option) {
          case "delayTime":
            this.feedbackDelay!.delayTime.value = update.value;
            break;
          case "feedback":
            this.feedbackDelay!.feedback.value = update.value;
            break;
        }
      });
    },
    freeverb: (updates) => {
      if (!this.freeverb) {
        this.applyFreeverb();
      }

      updates.map((update) => {
        switch (update.option) {
          case "roomSize":
            this.freeverb!.roomSize.value = update.value;
            break;
          case "dampening":
            this.freeverb!.dampening = update.value;
            break;
          default:
            break;
        }
      });
    },
    JCReverb: (updates) => {
      if (!this.JCReverb) {
        this.applyJCReverb();
      }

      updates.map((update) => {
        switch (update.option) {
          case "roomSize":
            this.JCReverb!.roomSize.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    phaser: (updates) => {
      if (!this.phaser) {
        this.applyPhaser();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.phaser!.frequency.value = update.value;
            break;
          case "octaves":
            this.phaser!.octaves = update.value;
            break;
          case "baseFrequency":
            this.phaser!.baseFrequency = update.value;
            break;
        }
      });
    },
    pingPongDelay: (updates) => {
      if (!this.pingPongDelay) {
        this.applyPingPongDelay();
      }

      updates.map((update) => {
        switch (update.option) {
          case "delayTime":
            this.pingPongDelay!.delayTime.value = update.value;
            break;
          case "feedback":
            this.pingPongDelay!.feedback.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    pitchShift: (updates) => {
      if (!this.pitchShift) {
        this.applyPitchShift();
      }

      updates.map((update) => {
        switch (update.option) {
          case "pitch":
            this.pitchShift!.pitch = update.value;
            break;
        }
      });
    },
    reverb: (updates) => {
      if (!this.reverb) {
        this.applyReverb();
      }

      updates.map((update) => {
        switch (update.option) {
          case "decay":
            this.reverb!.decay = update.value;
            break;
          case "preDelay":
            this.reverb!.preDelay = update.value;
            break;
        }
      });
    },
    stereoWidener: (updates) => {
      if (!this.stereoWidener) {
        this.applyStereoWidener();
      }

      updates.map((update) => {
        switch (update.option) {
          case "width":
            this.stereoWidener!.width.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    tremolo: (updates) => {
      if (!this.tremolo) {
        this.applyTremolo();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.tremolo!.frequency.value = update.value;
            break;
          case "depth":
            this.tremolo!.depth.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    vibrato: (updates) => {
      if (!this.vibrato) {
        this.applyVibrato();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.vibrato!.frequency.value = update.value;
            break;
          case "depth":
            this.vibrato!.depth.value = update.value;
            break;
          default:
            break;
        }
      });
    },
  };

  constructor(mediaStreamDestination: MediaStreamAudioDestinationNode) {
    this.mediaStreamDestination = mediaStreamDestination;

    this.volumeNode = new Tone.Volume(0); // 0 dB by default

    this.sampler = new Tone.Sampler(samplers.pianos.default.sampler);
    this.playOnlyDefined = samplers.pianos.default.playOnlyDefined;

    this.effectChain = new Tone.Gain(); // Create a Gain node for the effects chain

    // Set up the initial connections
    this.sampler.connect(this.volumeNode);
    this.volumeNode.connect(this.effectChain); // Connect volumeNode to the effects chain
    this.effectChain.connect(this.mediaStreamDestination); // Connect effects chain to mediaStreamDestination
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
      this.playOnlyDefined =
        // @ts-ignore
        samplers[sampler.category][sampler.kind].playOnlyDefined;

      if (this.playOnlyDefined) {
        this.definedNotes = Object.keys(
          // @ts-ignore
          samplers[sampler.category][sampler.kind].sampler.urls
        );
      }

      return {
        category: sampler.category,
        kind: sampler.kind,
        // @ts-ignore
        label: samplers[sampler.category][sampler.kind].label,
        playOnlyDefined: this.playOnlyDefined,
        definedNotes: this.definedNotes,
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
      this.playOnlyDefined =
        // @ts-ignore
        samplers[sampler.category][newKind].playOnlyDefined;
      if (this.playOnlyDefined) {
        this.definedNotes = Object.keys(
          // @ts-ignore
          samplers[sampler.category][newKind].sampler.urls
        );
      }

      return {
        // @ts-ignore
        category: sampler.category,
        kind: newKind as any,
        // @ts-ignore
        label: samplers[sampler.category][newKind].label,
        playOnlyDefined: this.playOnlyDefined,
        definedNotes: this.definedNotes,
      };
    }
  };

  // Trigger a note when a key is pressed
  playNote = (note: string, isPress: boolean) => {
    if (!this.sampler?.loaded) {
      return;
    }

    if (isPress) {
      if (!this.playingNotes.has(note)) {
        this.playingNotes.add(note);
        if (this.playOnlyDefined) {
          if (this.definedNotes.includes(note)) {
            this.sampler?.triggerAttack(note);
          }
        } else {
          this.sampler?.triggerAttack(note);
        }
      }
    } else {
      if (this.playingNotes.has(note)) {
        this.playingNotes.delete(note);
        this.sampler?.triggerRelease(note);
      }
    }
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };

  updateEffects = (
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) => {
    effects.map((effect) => {
      const updater = this.effectUpdaters[effect.type];
      if (updater) {
        updater(effect.updates);
      } else {
        console.error(`Effect ${effect.type} is not supported.`);
      }
    });
  };

  removeEffects = (effects: AudioMixEffectsType[]) => {
    effects.map((effect) => {
      switch (effect) {
        case "autoFilter":
          this.removeEffect(this.autoFilter);
          this.autoFilter = undefined;
          break;
        case "autoPanner":
          this.removeEffect(this.autoPanner);
          this.autoPanner = undefined;
          break;
        case "autoWah":
          this.removeEffect(this.autoWah);
          this.autoWah = undefined;
          break;
        case "bitCrusher":
          this.removeEffect(this.bitCrusher);
          this.bitCrusher = undefined;
          break;
        case "chebyshev":
          this.removeEffect(this.chebyshev);
          this.chebyshev = undefined;
          break;
        case "chorus":
          this.removeEffect(this.chorus);
          this.chorus = undefined;
          break;
        case "distortion":
          this.removeEffect(this.distortion);
          this.distortion = undefined;
          break;
        case "EQ":
          this.removeEffect(this.eq3);
          this.eq3 = undefined;
          break;
        case "feedbackDelay":
          this.removeEffect(this.feedbackDelay);
          this.feedbackDelay = undefined;
          break;
        case "freeverb":
          this.removeEffect(this.freeverb);
          this.freeverb = undefined;
          break;
        case "JCReverb":
          this.removeEffect(this.JCReverb);
          this.JCReverb = undefined;
          break;
        case "phaser":
          this.removeEffect(this.phaser);
          this.phaser = undefined;
          break;
        case "pingPongDelay":
          this.removeEffect(this.pingPongDelay);
          this.pingPongDelay = undefined;
          break;
        case "pitchShift":
          this.removeEffect(this.reverb);
          this.reverb = undefined;
          break;
        case "reverb":
          this.removeEffect(this.reverb);
          this.reverb = undefined;
          break;
        case "stereoWidener":
          this.removeEffect(this.stereoWidener);
          this.stereoWidener = undefined;
          break;
        case "tremolo":
          this.removeEffect(this.tremolo);
          this.tremolo = undefined;
          break;
        case "vibrato":
          this.removeEffect(this.vibrato);
          this.vibrato = undefined;
          break;
      }
    });
  };

  private removeEffect(effect: any | undefined) {
    if (!effect) return;

    const effectIndex = this.effects.indexOf(effect);

    if (effectIndex !== -1) {
      // Disconnect the effect from the chain
      effect.disconnect();

      // Reconnect the previous effect in the chain to the next one
      if (effectIndex > 0) {
        this.effects[effectIndex - 1].disconnect();
        if (effectIndex < this.effects.length - 1) {
          this.effects[effectIndex - 1].connect(this.effects[effectIndex + 1]);
        } else {
          this.effects[effectIndex - 1].connect(this.mediaStreamDestination);
        }
      } else {
        // If it's the first effect, reconnect the effectChain to the next effect or mediaStreamDestination
        this.effectChain.disconnect();
        if (this.effects.length > 1) {
          this.effectChain.connect(this.effects[1]);
        } else {
          this.effectChain.connect(this.mediaStreamDestination);
        }
      }

      // Remove the effect from the array
      this.effects.splice(effectIndex, 1);

      // Dispose of the effect
      effect.dispose();
    }
  }

  private addEffect(effect: any) {
    // Disconnect the last effect in the chain from the mediaStreamDestination
    if (this.effects.length > 0) {
      this.effects[this.effects.length - 1].disconnect();
      this.effects[this.effects.length - 1].connect(effect);
    } else {
      this.effectChain.disconnect();
      this.effectChain.connect(effect);
    }

    // Add the new effect to the chain
    this.effects.push(effect);

    // Connect the new effect to the mediaStreamDestination
    effect.connect(this.mediaStreamDestination);
  }

  /* 
    frequency: (0 - 10) Hz
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
  */
  private applyAutoFilter = () => {
    this.autoFilter = new Tone.AutoFilter().start();
    this.addEffect(this.autoFilter);
  };

  /* 
    frequency: (0 - 10) Hz
  */
  private applyAutoPanner = () => {
    this.autoPanner = new Tone.AutoPanner().start();
    this.addEffect(this.autoPanner);
  };

  /* 
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
    sensitivity: (-40 - 0) dB
  */
  private applyAutoWah = () => {
    this.autoWah = new Tone.AutoWah();
    this.addEffect(this.autoWah);
  };

  /* 
    bits: (1 - 8) bits
  */
  private applyBitCrusher = () => {
    this.bitCrusher = new Tone.BitCrusher();
    this.addEffect(this.bitCrusher);
  };

  /* 
    order: (1 - 100) order
  */
  private applyChebyshev = () => {
    this.chebyshev = new Tone.Chebyshev();
    this.addEffect(this.chebyshev);
  };

  /* 
    frequency: (0 - 10) Hz
    delayTime: (0 - 20) ms
    depth: (0 - 1) %
  */
  private applyChorus = () => {
    this.chorus = new Tone.Chorus().start();
    this.addEffect(this.chorus);
  };

  /* 
    distortion: (0 - 1) %
    oversample: (2, 4) x
  */
  private applyDistortion = () => {
    this.distortion = new Tone.Distortion();
    this.addEffect(this.distortion);
  };

  /* 
    low: (-24 - 24) dB
    mid: (-24 - 24) dB
    high: (-24 - 24) dB
  */
  private applyEQ = () => {
    this.eq3 = new Tone.EQ3();
    this.addEffect(this.eq3);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyFeedbackDelay = () => {
    this.feedbackDelay = new Tone.FeedbackDelay();
    this.addEffect(this.feedbackDelay);
  };

  /* 
    roomSize: (0 - 1) size
    dampening: (0 - 10000) Hz
  */
  private applyFreeverb = () => {
    this.freeverb = new Tone.Freeverb();
    this.addEffect(this.freeverb);
  };

  /* 
    roomSize: (0 - 1) size
  */
  private applyJCReverb = () => {
    this.JCReverb = new Tone.JCReverb();
    this.addEffect(this.JCReverb);
  };

  /* 
    frequency: (0 - 10) Hz
    octaves: (0 - 8) octaves
    baseFrequency: (0 - 10000) Hz
  */
  private applyPhaser = () => {
    this.phaser = new Tone.Phaser();
    this.addEffect(this.phaser);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyPingPongDelay = () => {
    this.pingPongDelay = new Tone.PingPongDelay();
    this.addEffect(this.pingPongDelay);
  };

  /* 
    pitch: (-12 - 12) semitones
  */
  private applyPitchShift = () => {
    this.pitchShift = new Tone.PitchShift();
    this.addEffect(this.pitchShift);
  };

  /* 
    decay: (1 - 10) seconds
    preDelay: (0 - 0.1) seconds
  */
  private applyReverb = () => {
    this.reverb = new Tone.Reverb();
    this.addEffect(this.reverb);
  };

  /* 
    width: (0 - 1) width
  */
  private applyStereoWidener = () => {
    this.stereoWidener = new Tone.StereoWidener();
    this.addEffect(this.stereoWidener);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyTremolo = () => {
    this.tremolo = new Tone.Tremolo().start();
    this.addEffect(this.tremolo);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyVibrato = () => {
    this.vibrato = new Tone.Vibrato();
    this.addEffect(this.vibrato);
  };
}

export default FgSampler;
