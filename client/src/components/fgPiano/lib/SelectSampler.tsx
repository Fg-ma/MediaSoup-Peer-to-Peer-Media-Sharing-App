import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSelectionButton from "../../../elements/fgSelectionButton/FgSelectionButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgPortal from "../../../elements/fgPortal/FgPortal";
import { navTransition, navVar } from "./SamplerToolbar";
import { FgSamplers } from "../../../audioEffects/fgSamplers";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetSeverBaseUrl + "svgs/navigateForward.svg";
const navigateBack = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";

const notes = [
  "C0",
  "C#0",
  "D0",
  "D#0",
  "E0",
  "F0",
  "F#0",
  "G0",
  "G#0",
  "A0",
  "A#0",
  "B0",
  "C1",
  "C#1",
  "D1",
  "D#1",
  "E1",
  "F1",
  "F#1",
  "G1",
  "G#1",
  "A1",
  "A#1",
  "B1",
  "C2",
  "C#2",
  "D2",
  "D#2",
  "E2",
  "F2",
  "F#2",
  "G2",
  "G#2",
  "A2",
  "A#2",
  "B2",
  "C3",
  "C#3",
  "D3",
  "D#3",
  "E3",
  "F3",
  "F#3",
  "G3",
  "G#3",
  "A3",
  "A#3",
  "B3",
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A4",
  "A#4",
  "B4",
  "C5",
  "C#5",
  "D5",
  "D#5",
  "E5",
  "F5",
  "F#5",
  "G5",
  "G#5",
  "A5",
  "A#5",
  "B5",
  "C6",
  "C#6",
  "D6",
  "D#6",
  "E6",
  "F6",
  "F#6",
  "G6",
  "G#6",
  "A6",
  "A#6",
  "B6",
];

const samplerSelections = {
  value: "instruments",
  Pianos: {
    value: "pianos",
    ["Default"]: "default",
    ["AC"]: {
      value: "ac",
      ["AC 1"]: "ac1",
      ["AC 2"]: "ac2",
    },
    ["Bell"]: "bell",
    ["Broken cassette"]: "brokenCassette",
    ["Clavi piano"]: "claviPiano",
    ["Curly electric"]: "curlyElectric",
    ["Dragon magic old"]: "dragonMagicOld",
    ["Electric"]: {
      value: "electric",
      ["Electric 1"]: "electric1",
      ["Electric 2"]: "electric2",
      ["Electric 3"]: "electric3",
      ["Electric 4"]: "electric4",
      ["Electric 5"]: "electric5",
    },
    ["Soft Steinway"]: "softSteinway",
    ["Studio one"]: {
      value: "studioOne",
      ["Studio one 1"]: "studioOne1",
      ["Studio one 2"]: "studioOne2",
      ["Studio one 3"]: "studioOne3",
      ["Studio one 4"]: "studioOne4",
      ["Studio one 5"]: "studioOne5",
      ["Studio one 6"]: "studioOne6",
      ["Studio one 7"]: "studioOne7",
      ["Studio one 8"]: "studioOne8",
      ["Studio one 9"]: "studioOne9",
      ["Studio one 10"]: "studioOne10",
      ["Studio one 11"]: "studioOne11",
      ["Studio one 12"]: "studioOne12",
      ["Studio one 13"]: "studioOne13",
    },
    ["Toy"]: "toy",
  },
  Guitars: {
    value: "guitars",
    ["AC Guitar"]: "acGuitar",
    ["Acoustic guitar"]: "acousticGuitar",
    ["AXA fifths bounce guitar"]: "AXAFifthsBounceGuitar",
    ["AXA voodoo vibe guitar"]: "AXAVoodooVibeGuitar",
    ["Bright guitar"]: "brightGuitar",
    ["Clanky amp metal guitar"]: "clankyAmpMetalGuitar",
    ["Clanky metal bass guitar"]: "clankyMetalBassGuitar",
    ["Ferrum iron guitar"]: "ferrumIronGuitar",
    ["Fresh guitar"]: "freshGuitar",
    ["Fretless guitar"]: "fretlessGuitar",
    ["Fuzz guitar"]: "fuzzGuitar",
    ["Mexican guitarron"]: "MexicanGuitarron",
    ["Muted guitar"]: "mutedGuitar",
    ["RJS guitar"]: "RJSGuitar",
  },
  Strings: {
    value: "strings",
    ["Basses"]: {
      value: "basses",
      ["AC bass"]: "acBass",
      ["Ana Bass"]: "anaBass",
      ["Electric bass 1"]: "electricBass1",
      ["Electric bass 2"]: "electricBass2",
      ["Jarre bass"]: "jarreBass",
      ["Long FM bass"]: "longFMBass",
      ["Moog bass"]: "moogBass",
      ["Short FM bass"]: "shortFMBass",
      ["Sweep bass"]: "sweepBass",
      ["Synth bass"]: "synthBass",
    },
    ["Cellos"]: {
      value: "cellos",
      ["Beyond bow cello"]: "beyondBowCello",
      ["Broken cello"]: "brokenCello",
      ["Cello"]: "cello",
    },
    ["Lyre lyre"]: {
      value: "lyreLyre",
      ["Lyre lyre 1"]: "lyreLyre1",
      ["Lyre lyre 2"]: "lyreLyre2",
      ["Lyre lyre 3"]: "lyreLyre3",
    },
    ["Strings"]: {
      value: "strings",
      ["Strings 1"]: "strings1",
      ["Strings 2"]: "strings2",
    },
    ["Uncle John's five string banjo"]: "uncleJohns5StringBanjo",
    ["Violin"]: "violin",
  },
  Winds: {
    value: "winds",
    ["Bass French horn"]: "bassFrenchHorn",
    ["Bass trombone"]: "bassTrombone",
    ["Bass trumpet"]: "bassTrumpet",
    ["Bass tuba"]: "bassTuba",
    ["Brass"]: {
      value: "brass",
      ["Brass 1"]: "brass1",
      ["Brass 2"]: "brass2",
    },
    ["Clarinet"]: "clarinet",
    ["Classic slide whistle"]: "classicSlideWhistle",
    ["Double bass"]: "doubleBass",
    ["Flugelhorn"]: "flugelhorn",
    ["Flutes"]: {
      value: "flutes",
      ["Flute"]: "flute",
      ["Forest flute"]: "forestFlute",
      ["Hover flute"]: "hoverFlute",
    },
    ["Oboe"]: {
      value: "oboe",
      ["Oboe 1"]: "oboe1",
      ["Oboe 2"]: "oboe2",
    },
    ["Recorder"]: "recorder",
    ["Saxophone"]: "saxophone",
    ["Tenor saxophone"]: "tenorSaxophone",
    ["Whistle"]: "whistle",
  },
  Drums: {
    value: "drums",
    ["Cassette"]: "cassette",
    ["Clave frog"]: "claveFrog",
    ["Garage sale drum kit"]: "garageSaleDrumKit",
    ["Hunter's percussion"]: {
      value: "huntersPercussion",
      ["Hunter's percussion bongos"]: "huntersPercussionBongos",
      ["Hunter's percussion conga"]: "huntersPercussionConga",
      ["Hunter's percussion djembe"]: "huntersPercussionDjembe",
      ["Hunter's percussion taiko family"]: "huntersPercussionTaikoFamily",
      ["Hunter's percussion udu"]: "huntersPercussionUdu",
    },
    ["Jon's cajons"]: "JonsCajons",
    ["Kitchen drum kit"]: "kitchenDrumKit",
    ["Metallophon"]: "metallophon",
    ["No.37"]: "No.37",
    ["Omani"]: "omani",
    ["Slit log"]: "slitLog",
    ["Solar winds"]: "solarWinds",
    ["Tin can"]: "tinCan",
  },
  Synths: {
    value: "synths",
    ["Lead synth"]: {
      value: "leadSynth",
      ["Lead synth 1"]: "leadSynth1",
      ["Lead synth 2"]: "leadSynth2",
      ["Lead synth 3"]: "leadSynth3",
      ["Lead synth 4"]: "leadSynth4",
      ["Lead synth 5"]: "leadSynth5",
      ["Lead synth 6"]: "leadSynth6",
      ["Lead synth 7"]: "leadSynth7",
    },
    ["Pad synth"]: {
      value: "padSynth",
      ["Pad synth 1"]: "padSynth1",
      ["Pad synth 2"]: "padSynth2",
    },
  },
  Organs: {
    value: "organs",
    ["Bottle"]: "bottle",
    ["Cassette tape"]: "cassetteTape",
    ["Electric"]: {
      value: "electric",
      ["Electric 1"]: "electric1",
      ["Electric 2"]: "electric2",
      ["Electric 3"]: "electric3",
    },
    ["Fallout"]: {
      value: "fallout",
      ["Fallout 1"]: "fallout1",
      ["Fallout 2"]: "fallout2",
      ["Fallout 3"]: "fallout3",
      ["Fallout 4"]: "fallout4",
      ["Fallout 5"]: "fallout5",
    },
    ["Little red"]: "littleRed",
    ["Pipe"]: {
      value: "pipe",
      ["Pipe 1"]: "pipe1",
      ["Pipe 2"]: "pipe2",
      ["Pipe 3"]: "pipe3",
    },
    ["Spooky"]: "spooky",
  },
  misc: {
    value: "misc",
    ["Accordion"]: "accordion",
    ["Austrian jaw harp"]: "AustrianJawHarp",
    ["Bells"]: {
      value: "bells",
      ["Ancient bronze bells"]: "ancientBronzeBells",
      ["Bells 1"]: "bells1",
      ["Bells 2"]: "bells2",
      ["Hand bells"]: "handBells",
    },
    ["Choirs"]: {
      value: "choirs",
      ["Choir of the fallen"]: "choirOfTheFallen",
      ["Discord choir"]: "discordChoir",
      ["Mechanised choir"]: "mechanisedChoir",
      ["Micah's choir"]: "MicahsChoir",
      ["Quiet Choir"]: "quietChoir",
    },
    ["Clavichord"]: "clavichord",
    ["Cosmos"]: "cosmos",
    ["Gongs"]: {
      value: "gongs",
      ["Bells gong"]: "bellsGong",
      ["Broken splash cymbal gong"]: "brokenSplashCymbalGong",
      ["Gong"]: "gong",
    },
    ["Harmonica"]: "harmonica",
    ["Marie pneuma"]: "MariePneuma",
    ["Marimba"]: "marimba",
    ["Musical stones"]: {
      value: "musicalStones",
      ["Musical stones 1"]: "musicalStones1",
      ["Musical stones 2"]: "musicalStones2",
    },
    ["Orchestra"]: "orchestra",
    ["Plasma drive kalimba"]: "plasmaDriveKalimba",
    ["Rain stick"]: "rainStick",
    ["Spell singer"]: "spellSinger",
    ["Street bounty xylophone"]: "streetBountyXylophone",
    ["Vibraphone"]: "vibraphone",
    ["Xylophone"]: "xylophone",
  },
};

export const samplerBackgroundMap = {
  pianos: {
    default: { category: "music", categorySelection: "pianoKeys" },
    ac1: { category: "music", categorySelection: "note" },
    ac2: { category: "music", categorySelection: "note" },
    bell: { category: "music", categorySelection: "musicStream" },
    brokenCassette: { category: "music", categorySelection: "pianoKeys" },
    claviPiano: { category: "music", categorySelection: "vinyl" },
    curlyElectric: { category: "music", categorySelection: "speakers" },
    dragonMagicOld: { category: "music", categorySelection: "musicStream" },
    electric1: { category: "music", categorySelection: "musicPattern" },
    electric2: { category: "music", categorySelection: "dj" },
    electric3: { category: "music", categorySelection: "turtleDJ" },
    electric4: { category: "music", categorySelection: "sheetMusic" },
    electric5: { category: "music", categorySelection: "sheetMusic" },
    softSteinway: {
      category: "music",
      categorySelection: "abstractInstruments",
    },
    studioOne1: { category: "music", categorySelection: "note" },
    studioOne2: { category: "music", categorySelection: "note" },
    studioOne3: { category: "music", categorySelection: "note" },
    studioOne4: { category: "music", categorySelection: "note" },
    studioOne5: { category: "music", categorySelection: "note" },
    studioOne6: { category: "music", categorySelection: "note" },
    studioOne7: { category: "music", categorySelection: "note" },
    studioOne8: { category: "music", categorySelection: "note" },
    studioOne9: { category: "music", categorySelection: "note" },
    studioOne10: { category: "music", categorySelection: "speakers" },
    studioOne11: { category: "music", categorySelection: "speakers" },
    studioOne12: { category: "music", categorySelection: "speakers" },
    studioOne13: { category: "music", categorySelection: "speakers" },
    toy: { category: "music", categorySelection: "musicPattern" },
  },
  guitars: {
    acGuitar: { category: "music", categorySelection: "limeLightGuitar" },
    acousticGuitar: { category: "music", categorySelection: "acousticGuitar" },
    AXAFifthsBounceGuitar: {
      category: "music",
      categorySelection: "rockGodGuitar",
    },
    AXAVoodooVibeGuitar: {
      category: "music",
      categorySelection: "paintElectricGuitar",
    },
    brightGuitar: {
      category: "music",
      categorySelection: "acousticGuitarSketch",
    },
    clankyAmpMetalGuitar: {
      category: "music",
      categorySelection: "rockGodGuitar",
    },
    clankyMetalBassGuitar: {
      category: "music",
      categorySelection: "electricGuitar",
    },
    ferrumIronGuitar: { category: "music", categorySelection: "velvetGuitar" },
    freshGuitar: { category: "music", categorySelection: "cleanGuitar" },
    fretlessGuitar: {
      category: "music",
      categorySelection: "paintElectricGuitar",
    },
    fuzzGuitar: { category: "music", categorySelection: "electricGuitar" },
    MexicanGuitarron: {
      category: "music",
      categorySelection: "acousticGuitarSketch",
    },
    mutedGuitar: { category: "music", categorySelection: "velvetGuitar" },
    RJSGuitar: { category: "music", categorySelection: "cleanGuitar" },
  },
  strings: {
    acBass: { category: "music", categorySelection: "bassMan" },
    anaBass: { category: "music", categorySelection: "bassMan" },
    electricBass1: { category: "music", categorySelection: "dj" },
    electricBass2: { category: "music", categorySelection: "bassMan" },
    jarreBass: { category: "music", categorySelection: "abstractInstruments" },
    longFMBass: { category: "music", categorySelection: "controls" },
    moogBass: { category: "music", categorySelection: "abstractInstruments" },
    shortFMBass: { category: "music", categorySelection: "bassMan" },
    sweepBass: { category: "music", categorySelection: "note" },
    synthBass: { category: "music", categorySelection: "vinyl" },
    beyondBowCello: { category: "music", categorySelection: "cello" },
    brokenCello: { category: "music", categorySelection: "cello" },
    cello: { category: "music", categorySelection: "cello" },
    lyreLyre1: { category: "music", categorySelection: "musicStream" },
    lyreLyre2: { category: "music", categorySelection: "musicStream" },
    lyreLyre3: { category: "music", categorySelection: "musicStream" },
    strings1: { category: "music", categorySelection: "abstractInstruments" },
    strings2: { category: "music", categorySelection: "musicPattern" },
    uncleJohns5StringBanjo: {
      category: "music",
      categorySelection: "sheetMusic",
    },
    violin: { category: "music", categorySelection: "violin" },
  },
  winds: {
    bassFrenchHorn: { category: "music", categorySelection: "FrenchHornCombo" },
    bassTrombone: {
      category: "music",
      categorySelection: "abstractInstruments",
    },
    bassTrumpet: { category: "music", categorySelection: "trumpetMan" },
    bassTuba: { category: "music", categorySelection: "dj" },
    brass1: { category: "music", categorySelection: "sheetMusic" },
    brass2: { category: "music", categorySelection: "musicStream" },
    clarinet: { category: "music", categorySelection: "clarinet" },
    classicSlideWhistle: {
      category: "music",
      categorySelection: "musicStream",
    },
    doubleBass: { category: "music", categorySelection: "abstractInstruments" },
    flugelhorn: { category: "music", categorySelection: "note" },
    flute: { category: "music", categorySelection: "flute" },
    forestFlute: { category: "music", categorySelection: "musicStream" },
    hoverFlute: { category: "music", categorySelection: "flute" },
    oboe1: { category: "music", categorySelection: "abstractInstruments" },
    oboe2: { category: "music", categorySelection: "musicPattern" },
    recorder: { category: "music", categorySelection: "note" },
    saxophone: { category: "music", categorySelection: "subwaySaxophone" },
    tenorSaxophone: { category: "music", categorySelection: "subwaySaxophone" },
    whistle: { category: "music", categorySelection: "note" },
  },
  drums: {
    cassette: { category: "music", categorySelection: "note" },
    claveFrog: { category: "music", categorySelection: "musicStream" },
    garageSaleDrumKit: { category: "music", categorySelection: "drums" },
    huntersPercussionBongos: {
      category: "music",
      categorySelection: "abstractInstruments",
    },
    huntersPercussionConga: {
      category: "music",
      categorySelection: "abstractInstruments",
    },
    huntersPercussionDjembe: {
      category: "music",
      categorySelection: "abstractInstruments",
    },
    huntersPercussionTaikoFamily: {
      category: "music",
      categorySelection: "abstractInstruments",
    },
    huntersPercussionUdu: {
      category: "music",
      categorySelection: "abstractInstruments",
    },
    JonsCajons: { category: "music", categorySelection: "musicPattern" },
    kitchenDrumKit: { category: "music", categorySelection: "musicStream" },
    metallophon: { category: "music", categorySelection: "note" },
    "No.37": { category: "music", categorySelection: "drums" },
    omani: { category: "music", categorySelection: "dj" },
    slitLog: { category: "music", categorySelection: "musicStream" },
    solarWinds: { category: "music", categorySelection: "musicPattern" },
    tinCan: { category: "music", categorySelection: "turtleDJ" },
  },
  synths: {
    leadSynth1: { category: "music", categorySelection: "controls" },
    leadSynth2: { category: "music", categorySelection: "dj" },
    leadSynth3: { category: "music", categorySelection: "turtleDJ" },
    leadSynth4: { category: "music", categorySelection: "vinyl" },
    leadSynth5: { category: "music", categorySelection: "speakers" },
    leadSynth6: { category: "music", categorySelection: "musicPattern" },
    leadSynth7: { category: "music", categorySelection: "note" },
    padSynth1: { category: "music", categorySelection: "dj" },
    padSynth2: { category: "music", categorySelection: "turtleDJ" },
  },
  organs: {
    bottle: { category: "music", categorySelection: "sheetMusic" },
    cassetteTape: { category: "music", categorySelection: "turtleDJ" },
    electric1: { category: "music", categorySelection: "dj" },
    electric2: { category: "music", categorySelection: "musicStream" },
    electric3: { category: "music", categorySelection: "musicPattern" },
    fallout1: { category: "music", categorySelection: "organ" },
    fallout2: { category: "music", categorySelection: "turtleDJ" },
    fallout3: { category: "music", categorySelection: "abstractInstruments" },
    fallout4: { category: "music", categorySelection: "note" },
    fallout5: { category: "music", categorySelection: "musicStream" },
    littleRed: { category: "music", categorySelection: "sheetMusic" },
    pipe1: { category: "music", categorySelection: "organ" },
    pipe2: { category: "music", categorySelection: "organ" },
    pipe3: { category: "music", categorySelection: "organ" },
    spooky: { category: "music", categorySelection: "organ" },
  },
  misc: {
    accordion: { category: "music", categorySelection: "note" },
    AustrianJawHarp: { category: "music", categorySelection: "musicPattern" },
    ancientBronzeBells: { category: "music", categorySelection: "note" },
    bells1: { category: "music", categorySelection: "note" },
    bells2: { category: "music", categorySelection: "note" },
    handBells: { category: "music", categorySelection: "note" },
    choirOfTheFallen: { category: "music", categorySelection: "venue" },
    discordChoir: { category: "music", categorySelection: "venue" },
    mechanisedChoir: { category: "music", categorySelection: "venue" },
    MicahsChoir: { category: "music", categorySelection: "venue" },
    quietChoir: { category: "music", categorySelection: "venue" },
    clavichord: { category: "music", categorySelection: "turtleDJ" },
    cosmos: { category: "music", categorySelection: "dj" },
    bellsGong: { category: "music", categorySelection: "dj" },
    brokenSplashCymbalGong: {
      category: "music",
      categorySelection: "turtleDJ",
    },
    gong: { category: "music", categorySelection: "dj" },
    harmonica: { category: "music", categorySelection: "abstractInstruments" },
    MariePneuma: { category: "music", categorySelection: "musicPattern" },
    marimba: { category: "music", categorySelection: "note" },
    musicalStones1: { category: "music", categorySelection: "musicPattern" },
    musicalStones2: { category: "music", categorySelection: "musicStream" },
    orchestra: { category: "music", categorySelection: "sheetMusic" },
    plasmaDriveKalimba: { category: "music", categorySelection: "musicStream" },
    rainStick: { category: "music", categorySelection: "note" },
    spellSinger: { category: "music", categorySelection: "musicStream" },
    streetBountyXylophone: { category: "music", categorySelection: "note" },
    vibraphone: { category: "music", categorySelection: "turtleDJ" },
    xylophone: { category: "music", categorySelection: "sheetMusic" },
  },
};

export default function SelectSampler({
  sampler,
  setSampler,
}: {
  sampler: FgSamplers;
  setSampler: React.Dispatch<React.SetStateAction<FgSamplers>>;
}) {
  const { userMedia } = useMediaContext();

  const [hover, setHover] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout>();
  const selectSamplerLabelRef = useRef<HTMLDivElement>(null);

  const handlePointerEnter = () => {
    if (selectSamplerLabelRef.current?.classList.contains("truncate")) {
      document.addEventListener("pointermove", handlePointerMove);

      if (!hoverTimeout.current) {
        hoverTimeout.current = setTimeout(() => {
          setHover(true);
        }, 750);
      }
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (
      selectSamplerLabelRef.current &&
      !selectSamplerLabelRef.current.contains(event.target as Node)
    ) {
      document.removeEventListener("pointermove", handlePointerMove);

      setHover(false);
      if (hoverTimeout.current !== undefined) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = undefined;
      }
    }
  };

  const handlePointerDown = () => {
    document.removeEventListener("pointermove", handlePointerMove);

    setHover(false);
    if (hoverTimeout.current !== undefined) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = undefined;
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (
      event.target &&
      selectSamplerLabelRef.current?.contains(event.target as Node)
    ) {
      document.addEventListener("pointermove", handlePointerMove);

      setHover(true);
      if (!hoverTimeout.current) {
        hoverTimeout.current = setTimeout(() => {
          setHover(true);
        }, 750);
      }
    }
  };

  useEffect(() => {
    const piano: HTMLElement | null = document.querySelector(".piano");
    const selectSamplerLabel: HTMLElement | null = document.querySelector(
      ".select-sampler-label"
    );

    if (piano && selectSamplerLabel) {
      selectSamplerLabel.classList.remove("truncate", "w-max");
      selectSamplerLabel.style.width = "";

      if (selectSamplerLabel.clientWidth > piano.clientWidth / 4) {
        selectSamplerLabel.classList.add("truncate");
        selectSamplerLabel.style.width = `${piano.clientWidth / 4}px`;
      } else {
        selectSamplerLabel.classList.add("w-max");
      }
    }

    for (const note of notes) {
      const octave = note.slice(-1);
      const noteName = note.slice(0, -1);

      const noteElement: HTMLButtonElement | null = document.getElementById(
        `piano_key_${octave}_${noteName}`
      ) as HTMLButtonElement;

      if (
        noteElement &&
        sampler.playOnlyDefined &&
        !sampler.definedNotes?.includes(note)
      ) {
        noteElement.disabled = true;
      }
      if (
        noteElement &&
        (!sampler.playOnlyDefined || sampler.definedNotes?.includes(note))
      ) {
        noteElement.disabled = false;
      }
    }
  }, [sampler]);

  useEffect(() => {
    userMedia.current.audio?.swapSampler({
      category: sampler.category,
      kind: sampler.kind,
    });
  }, []);

  return (
    <div className='flex font-K2D text-lg items-center justify-center space-x-1'>
      <FgButton
        className='w-6 aspect-square rounded-full flex items-center justify-center pr-0.5'
        contentFunction={() => (
          <FgSVG
            src={navigateBack}
            attributes={[
              { key: "height", value: "1rem" },
              { key: "width", value: "1rem" },
            ]}
          />
        )}
        clickFunction={() => {
          const newSampler = userMedia.current.audio?.swapSampler(sampler, -1);
          if (newSampler) {
            setSampler(newSampler);
          }
        }}
        animationOptions={{
          variants: navVar,
          transition: navTransition,
          whileHover: "hover",
        }}
      />
      <FgSelectionButton
        content={
          <div
            ref={selectSamplerLabelRef}
            className='select-sampler-label'
            onPointerEnter={handlePointerEnter}
          >
            {sampler.label}
            {hover && (
              <FgPortal
                type='below'
                content={
                  <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                    {sampler.label}
                  </div>
                }
                externalRef={selectSamplerLabelRef}
              />
            )}
          </div>
        }
        selections={samplerSelections}
        valueSelectionFunction={(selection) => {
          const newSampler = userMedia.current.audio?.swapSampler({
            category: selection[0],
            kind: selection[selection.length - 1],
          });
          if (newSampler) {
            setSampler(newSampler);
          }
        }}
        pointerDownFunction={handlePointerDown}
        pointerUpFunction={handlePointerUp}
        options={{ mode: "pick" }}
      />
      <FgButton
        className='w-6 aspect-square rounded-full flex items-center justify-center pl-0.5'
        contentFunction={() => (
          <FgSVG
            src={navigateForward}
            attributes={[
              { key: "height", value: "1rem" },
              { key: "width", value: "1rem" },
            ]}
          />
        )}
        clickFunction={() => {
          const newSampler = userMedia.current.audio?.swapSampler(sampler, 1);
          if (newSampler) {
            setSampler(newSampler);
          }
        }}
        animationOptions={{
          variants: navVar,
          transition: navTransition,
          whileHover: "hover",
        }}
      />
    </div>
  );
}
