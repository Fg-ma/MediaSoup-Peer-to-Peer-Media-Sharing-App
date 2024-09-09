import React, { useEffect, useRef, useState } from "react";
import { useStreamsContext } from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSelectionButton from "../../fgSelectionButton/FgSelectionButton";
import FgSVG from "../../fgSVG/FgSVG";
import { navTransition, navVar } from "./SamplerToolbar";
import navigateForward from "../../../public/svgs/navigateForward.svg";
import navigateBack from "../../../public/svgs/navigateBack.svg";
import FgPortal from "../../fgPortal/FgPortal";
import { FgSamplers } from "../../effects/audioEffects/fgSamplers";

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

export default function SelectSampler() {
  const { userMedia } = useStreamsContext();

  const [sampler, setSampler] = useState<FgSamplers>({
    category: "pianos",
    kind: "default",
    label: "Default",
    playOnlyDefined: false,
    definedNotes: [],
  });
  const [hover, setHover] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout>();
  const selectSamplerLabelRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (selectSamplerLabelRef.current?.classList.contains("truncate")) {
      document.addEventListener("mousemove", handleMouseMove);

      if (!hoverTimeout.current) {
        hoverTimeout.current = setTimeout(() => {
          setHover(true);
        }, 750);
      }
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (
      selectSamplerLabelRef.current &&
      !selectSamplerLabelRef.current.contains(event.target as Node)
    ) {
      document.removeEventListener("mousemove", handleMouseMove);

      setHover(false);
      if (hoverTimeout.current !== undefined) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = undefined;
      }
    }
  };

  const handleMouseDown = () => {
    document.removeEventListener("mousemove", handleMouseMove);

    setHover(false);
    if (hoverTimeout.current !== undefined) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = undefined;
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (
      event.target &&
      selectSamplerLabelRef.current?.contains(event.target as Node)
    ) {
      document.addEventListener("mousemove", handleMouseMove);

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

  return (
    <div className='font-K2D text-lg flex items-center justify-center space-x-1'>
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
            onMouseEnter={handleMouseEnter}
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
        mouseDownFunction={handleMouseDown}
        mouseUpFunction={handleMouseUp}
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
