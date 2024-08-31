import React, { useEffect, useRef, useState } from "react";
import { useStreamsContext } from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSelectionButton from "../../fgSelectionButton/FgSelectionButton";
import FgSVG from "../../fgSVG/FgSVG";
import { Samplers } from "../../effects/audioEffects/FgSampler";
import { navTransition, navVar } from "./ScaleSectionToolbar";
import navigateForward from "../../../public/svgs/navigateForward.svg";
import navigateBack from "../../../public/svgs/navigateBack.svg";

export default function SelectSampler({
  toolbarRef,
}: {
  toolbarRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useStreamsContext();

  const [sampler, setSampler] = useState<Samplers>({
    category: "pianos",
    kind: "default",
    label: "Default",
  });
  const [width, setWidth] = useState(0);
  const selectSamplerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toolbarRef.current && selectSamplerRef.current) {
      const newWidth = Math.min(
        toolbarRef.current.clientWidth / 4,
        selectSamplerRef.current.clientWidth
      );
      console.log(newWidth, selectSamplerRef.current.clientWidth);
      setWidth(newWidth);
    }
  }, [toolbarRef.current?.clientWidth, selectSamplerRef.current?.clientWidth]);

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
            ref={selectSamplerRef}
            className='truncate'
            style={{
              width: width !== 0 ? `${width}px` : "max-content",
            }}
          >
            {sampler.label}
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
            ["Brass French horn"]: "brassFrenchHorn",
            ["Brass trombone"]: "brassTrombone",
            ["Brass trumpet"]: "brassTrumpet",
            ["Brass tuba"]: "brassTuba",
            ["Classic slide whistle"]: "classicSlideWhistle",
            ["Forest flute"]: "forestFlute",
            ["Oboe"]: "oboe",
          },
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
