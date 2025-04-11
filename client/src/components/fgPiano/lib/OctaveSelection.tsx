import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgPortal from "../../../elements/fgPortal/FgPortal";
import { Octaves } from "../FgPiano";
import { navTransition, navVar } from "./SamplerToolbar";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";
const navigateBack = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function OctaveSelection({
  visibleOctaveRef,
  scrollToOctave,
}: {
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  scrollToOctave: (octave: Octaves) => void;
}) {
  const [hover, setHover] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout>();
  const octaveDivRef = useRef<HTMLDivElement>(null);
  const octaveLabelRef = useRef<HTMLDivElement>(null);

  const handlePointerEnter = () => {
    if (octaveLabelRef.current?.classList.contains("hidden")) {
      document.addEventListener("pointermove", handlePointerMove);

      hoverTimeout.current = setTimeout(() => {
        setHover(true);
      }, 750);
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (
      octaveDivRef.current &&
      !octaveDivRef.current.contains(event.target as Node)
    ) {
      document.removeEventListener("pointermove", handlePointerMove);

      setHover(false);
      if (hoverTimeout.current !== undefined) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = undefined;
      }
    }
  };

  return (
    <div className="flex items-center justify-center space-x-1 font-K2D text-lg">
      <AnimatePresence>
        {visibleOctaveRef.current !== 0 && (
          <motion.div
            variants={navVar}
            initial="leftInit"
            animate="leftAnimate"
            exit="leftInit"
            transition={navTransition}
          >
            <FgButton
              className="flex aspect-square w-6 items-center justify-center rounded-full pr-0.5"
              contentFunction={() => (
                <FgSVGElement
                  src={navigateBack}
                  className="fill-fg-off-white stroke-fg-off-white"
                  attributes={[
                    { key: "height", value: "1rem" },
                    { key: "width", value: "1rem" },
                  ]}
                />
              )}
              animationOptions={{
                variants: navVar,
                transition: navTransition,
                whileHover: "hover",
              }}
              clickFunction={() =>
                scrollToOctave(
                  Math.max(0, visibleOctaveRef.current - 1) as Octaves,
                )
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        ref={octaveDivRef}
        className="octave-container mb-0.5 flex grow cursor-default select-none truncate text-fg-off-white"
        onPointerEnter={handlePointerEnter}
      >
        <div ref={octaveLabelRef} className="octave-label">
          Octave
        </div>
        <div>{visibleOctaveRef.current}</div>
      </div>
      {hover && (
        <FgPortal
          type="below"
          content={<FgHoverContentStandard content="Octave" style="dark" />}
          externalRef={octaveDivRef}
        />
      )}
      <AnimatePresence>
        {visibleOctaveRef.current !== 6 && (
          <motion.div
            variants={navVar}
            initial="rightInit"
            animate="rightAnimate"
            exit="rightInit"
            transition={navTransition}
          >
            <FgButton
              className="flex aspect-square w-6 items-center justify-center rounded-full pl-0.5"
              contentFunction={() => (
                <FgSVGElement
                  src={navigateForward}
                  className="fill-fg-off-white stroke-fg-off-white"
                  attributes={[
                    { key: "height", value: "1rem" },
                    { key: "width", value: "1rem" },
                  ]}
                />
              )}
              clickFunction={() =>
                scrollToOctave(
                  Math.min(6, visibleOctaveRef.current + 1) as Octaves,
                )
              }
              animationOptions={{
                variants: navVar,
                transition: navTransition,
                whileHover: "hover",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
