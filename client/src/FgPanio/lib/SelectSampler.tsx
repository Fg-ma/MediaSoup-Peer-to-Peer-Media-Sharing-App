import React, { useEffect, useRef, useState } from "react";
import { useStreamsContext } from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSelectionButton from "../../fgSelectionButton/FgSelectionButton";
import FgSVG from "../../fgSVG/FgSVG";
import { Samplers } from "../../effects/audioEffects/FgSampler";
import { navTransition, navVar } from "./SamplerToolbar";
import navigateForward from "../../../public/svgs/navigateForward.svg";
import navigateBack from "../../../public/svgs/navigateBack.svg";
import FgPortal from "../../fgPortal/FgPortal";

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

  const [sampler, setSampler] = useState<Samplers>({
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
            ["Broken cassette"]: "brokenCassette",
            ["Curly electric"]: "curlyElectric",
            ["Dragon magic"]: "dragonMagicOld",
            ["Soft Steinway"]: "softSteinway",
          },
          Strings: {
            value: "strings",
            ["Acoustic guitar"]: "acousticGuitar",
            ["AXA fifths bounce guitar"]: "AXAFifthsBounceGuitar",
            ["AXA voodoo vibe guitar"]: "AXAVoodooVibeGuitar",
            ["Broken cello"]: "brokenCello",
            ["Clanky amp metal guitar"]: "clankyAmpMetalGuitar",
            ["Clanky metal bass guitar"]: "clankyMetalBassGuitar",
            ["Ferrum iron guitar"]: "ferrumIronGuitar",
            ["Fresh guitar"]: "freshGuitar",
            ["Mexican guitarron"]: "MexicanGuitarron",
            ["RJS guitar"]: "RJSGuitar",
            ["Uncle John's five string banjo"]: "uncleJohns5StringBanjo",
          },
          Winds: {
            value: "winds",
            ["Bass French horn"]: "bassFrenchHorn",
            ["Bass trombone"]: "bassTrombone",
            ["Brss trumpet"]: "bassTrumpet",
            ["Bass tuba"]: "bassTuba",
            ["Clarinet"]: "clarinet",
            ["Classic slide whistle"]: "classicSlideWhistle",
            ["Forest flute"]: "forestFlute",
            ["Oboe"]: "oboe",
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
          Organs: { value: "organs", ["Bottle organ"]: "bottleOrgan" },
        }}
        valueSelectionFunction={(selection) => {
          const newSampler = userMedia.current.audio?.swapSampler({
            category: selection[0],
            kind: selection[1],
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
