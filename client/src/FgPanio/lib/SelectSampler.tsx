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
        !sampler.definedNotes.includes(note)
      ) {
        noteElement.disabled = true;
      }
      if (
        noteElement &&
        (!sampler.playOnlyDefined || sampler.definedNotes.includes(note))
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
        selections={{
          value: "instruments",
          Pianos: {
            value: "pianos",
            ["Default"]: "default",
            ["AC piano"]: {
              value: "acPiano",
              ["AC piano 1"]: "acPiano1",
              ["AC piano 2"]: "acPiano2",
            },
            ["Broken cassette"]: "brokenCassette",
            ["Clavi piano"]: "claviPiano",
            ["Curly electric"]: "curlyElectric",
            ["Dragon magic"]: "dragonMagicOld",
            ["Electric piano"]: {
              value: "electricPiano",
              ["Electric piano 1"]: "electricPiano1",
              ["Electric piano 2"]: "electricPiano2",
              ["Electric piano 3"]: "electricPiano3",
              ["Electric piano 4"]: "electricPiano4",
              ["Electric piano 5"]: "electricPiano5",
            },
            ["Soft Steinway"]: "softSteinway",
            ["Toy piano"]: "toyPiano",
          },
          Strings: {
            value: "strings",
            ["AC bass"]: "acBass",
            ["AC Guitar"]: "acGuitar",
            ["Acoustic guitar"]: "acousticGuitar",
            ["Ana Bass"]: "anaBass",
            ["AXA fifths bounce guitar"]: "AXAFifthsBounceGuitar",
            ["AXA voodoo vibe guitar"]: "AXAVoodooVibeGuitar",
            ["Beyond bow cello"]: "beyondBowCello",
            ["Bright guitar"]: "brightGuitar",
            ["Broken cello"]: "brokenCello",
            ["Cello"]: "cello",
            ["Clanky amp metal guitar"]: "clankyAmpMetalGuitar",
            ["Clanky metal bass guitar"]: "clankyMetalBassGuitar",
            ["Electric bass"]: {
              value: "electricBass",
              ["Electric bass 1"]: "electricBass1",
              ["Electric bass 2"]: "electricBass2",
            },
            ["Ferrum iron guitar"]: "ferrumIronGuitar",
            ["Fresh guitar"]: "freshGuitar",
            ["Fretless guitar"]: "fretlessGuitar",
            ["Fuzz guitar"]: "fuzzGuitar",
            ["Jarre bass"]: "jarreBass",
            ["Long FM bass"]: "longFMBass",
            ["Mexican guitarron"]: "MexicanGuitarron",
            ["Moog bass"]: "moogBass",
            ["Muted guitar"]: "mutedGuitar",
            ["RJS guitar"]: "RJSGuitar",
            ["Short FM bass"]: "shortFMBass",
            ["Strings"]: {
              value: "strings",
              ["Strings 1"]: "strings1",
              ["Strings 2"]: "strings2",
            },
            ["Sweep bass"]: "sweepBass",
            ["Synth bass"]: "synthBass",
            ["Uncle John's five string banjo"]: "uncleJohns5StringBanjo",
            ["Violin"]: "violin",
          },
          Winds: {
            value: "winds",
            ["Bass French horn"]: "bassFrenchHorn",
            ["Bass trombone"]: "bassTrombone",
            ["Brss trumpet"]: "bassTrumpet",
            ["Bass tuba"]: "bassTuba",
            ["Clarinet"]: "clarinet",
            ["Classic slide whistle"]: "classicSlideWhistle",
            ["Flugelhorn"]: "flugelhorn",
            ["Flute"]: "flute",
            ["Forest flute"]: "forestFlute",
            ["Hover flute"]: "hoverFlute",
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
            ["Broken splash cymbal gong"]: "brokenSplashCymbalGong",
            ["Clave frog"]: "claveFrog",
            ["Garage sale drum kit"]: "garageSaleDrumKit",
            ["Hand bells"]: "handBells",
            ["Jon's cajons"]: "JonsCajons",
            ["Kitchen drum kit"]: "kitchenDrumKit",
            ["Metallophon"]: "metallophon",
            ["Slit log drum"]: "slitLogDrum",
            ["Solar winds"]: "solarWinds",
            ["Tin can drums"]: "tinCanDrums",
          },
          Synths: { value: "synths" },
          Organs: { value: "organs", ["Bottle organ"]: "bottleOrgan" },
          misc: { value: "misc" },
        }}
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
