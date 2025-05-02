import React, { useEffect, useRef, useState } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { Octaves } from "../FgPiano";
import SelectSampler, { samplerBackgroundMap } from "./SelectSampler";
import SamplerVolume from "./SamplerVolume";
import OctaveSelection from "./OctaveSelection";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgPianoController from "./FgPianoController";
import SamplerMetronome from "./SamplerMetronome";
import FgBackgroundSelector from "../../../elements/fgBackgroundSelector/FgBackgroundSelector";
import { FgSamplers } from "../../../audioEffects/fgSamplers";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetServerBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetServerBaseUrl + "svgs/effectOffIcon.svg";
const keyVisualizerIcon =
  nginxAssetServerBaseUrl + "svgs/audioEffects/keyVisualizerIcon.svg";
const keyVisualizerOffIcon =
  nginxAssetServerBaseUrl + "svgs/audioEffects/keyVisualizerOffIcon.svg";

export const navVar: Variants = {
  leftInit: { opacity: 0, x: -20 },
  leftAnimate: {
    opacity: 1,
    x: 0,
  },
  rightInit: { opacity: 0, x: 20 },
  rightAnimate: {
    opacity: 1,
    x: 0,
  },
  hover: { backgroundColor: "rgb(64 64 64)", fill: "rgb(255, 255, 255)" },
};

export const navTransition: Transition = {
  transition: {
    duration: 0.15,
    ease: "linear",
  },
};

export default function SamplerToolbar({
  focus,
  fgPianoController,
  visibleOctaveRef,
  samplerEffectsActive,
  setSamplerEffectsActive,
  keyVisualizerActive,
  setKeyVisualizerActive,
  keyVisualizerActiveRef,
  keyVisualizerContainerRef,
}: {
  focus: boolean;
  fgPianoController: React.MutableRefObject<FgPianoController>;
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  samplerEffectsActive: boolean;
  setSamplerEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  keyVisualizerActive: boolean;
  setKeyVisualizerActive: React.Dispatch<React.SetStateAction<boolean>>;
  keyVisualizerActiveRef: React.MutableRefObject<boolean>;
  keyVisualizerContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const [sampler, setSampler] = useState<FgSamplers>({
    category: "pianos",
    kind: "default",
    label: "Default",
    playOnlyDefined: false,
    definedNotes: [],
  });
  const rightScaleSectionToolbarRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (rightScaleSectionToolbarRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        rightScaleSectionToolbarRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        rightScaleSectionToolbarRef.current.scrollLeft -= event.deltaY / 2;
      }
    }
  };

  useEffect(() => {
    rightScaleSectionToolbarRef.current?.addEventListener("wheel", handleWheel);

    // Cleanup event listener on unmount
    return () => {
      rightScaleSectionToolbarRef.current?.removeEventListener(
        "wheel",
        handleWheel,
      );
    };
  }, []);

  return (
    <div className="mb-1 flex h-8 w-full justify-between px-2">
      <motion.div
        className="z-20 flex h-8 w-max items-center space-x-2 pr-2"
        animate={{
          boxShadow: `8px 0 4px -3px  ${
            focus ? "rgb(22, 22, 22)" : "rgba(33, 33, 33)"
          }`,
        }}
        transition={{
          boxShadow: { duration: 0.3, ease: "linear" },
        }}
      >
        <FgButton
          contentFunction={() => {
            const iconSrc = keyVisualizerActive
              ? keyVisualizerOffIcon
              : keyVisualizerIcon;

            return (
              <FgSVGElement
                src={iconSrc}
                className="fill-fg-off-white stroke-fg-off-white"
                attributes={[
                  { key: "height", value: "95%" },
                  { key: "width", value: "95%" },
                ]}
              />
            );
          }}
          clickFunction={() => {
            setKeyVisualizerActive((prev) => !prev);
            keyVisualizerActiveRef.current = !keyVisualizerActiveRef.current;
          }}
          hoverContent={
            <FgHoverContentStandard
              content={
                samplerEffectsActive ? "Close key visualizer" : "Key visualizer"
              }
            />
          }
          className="relative flex aspect-square h-8 min-h-8 items-center justify-center"
          options={{ hoverType: "below", hoverTimeoutDuration: 750 }}
        />
        {keyVisualizerActive && (
          <FgBackgroundSelector
            backgroundRef={keyVisualizerContainerRef}
            defaultActiveBackground={
              // @ts-expect-error: correlation error
              samplerBackgroundMap[sampler.category][sampler.kind]
            }
          />
        )}
        <FgButton
          contentFunction={() => {
            const iconSrc = samplerEffectsActive ? effectOffIcon : effectIcon;

            return (
              <FgSVGElement
                src={iconSrc}
                className="fill-fg-off-white stroke-fg-off-white"
                attributes={[
                  { key: "height", value: "95%" },
                  { key: "width", value: "95%" },
                ]}
              />
            );
          }}
          clickFunction={() => {
            setSamplerEffectsActive((prev) => !prev);
          }}
          hoverContent={
            <FgHoverContentStandard
              content={samplerEffectsActive ? "Close effects" : "Effects"}
            />
          }
          className="relative flex aspect-square h-8 min-h-8 items-center justify-center"
          options={{ hoverType: "below", hoverTimeoutDuration: 750 }}
        />
        <SamplerMetronome />
        <SamplerVolume />
      </motion.div>
      <div
        ref={rightScaleSectionToolbarRef}
        className="hide-scroll-bar z-10 flex h-8 w-max scale-x-[-1] items-center space-x-2 overflow-x-auto pr-2"
      >
        <div className="flex scale-x-[-1] items-center space-x-2">
          <OctaveSelection
            visibleOctaveRef={visibleOctaveRef}
            scrollToOctave={fgPianoController.current.scrollToOctave}
          />
          <SelectSampler sampler={sampler} setSampler={setSampler} />
        </div>
      </div>
    </div>
  );
}
