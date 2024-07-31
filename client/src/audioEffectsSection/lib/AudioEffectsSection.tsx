import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
import {
  AudioEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import FgSVG from "../../fgSVG/FgSVG";
import muteIcon from "../../../public/svgs/audio/muteIcon.svg";
import mixAudioEffectsIcon from "../../../public/svgs/mixAudioEffectsIcon.svg";
import mixAudioEffectsOffIcon from "../../../public/svgs/mixAudioEffectsOffIcon.svg";
import robotIcon from "../../../public/svgs/audio/robotIcon.svg";

const AudioEffectsSectionVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const AudioEffectsSectionTransition: Transition = {
  transition: {
    opacity: { duration: 0.001 },
    scale: { duration: 0.001 },
  },
};

export default function AudioEffectsSection({
  type,
  buttonRef,
  audioMixEffectsActive,
  setAudioMixEffectsActive,
}: {
  type: "above" | "below";
  buttonRef: React.RefObject<HTMLButtonElement>;
  audioMixEffectsActive: boolean;
  setAudioMixEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia } = useStreamsContext();
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (!buttonRect || !portalRef.current) {
      return;
    }

    let top: number = 0;
    if (type === "above") {
      top = buttonRect.top - portalRef.current.clientHeight;
    } else if (type === "below") {
      top = buttonRect.top + buttonRect.height;
    }
    const left =
      buttonRect.left +
      buttonRect.width / 2 -
      portalRef.current.clientWidth / 2;

    const bodyRect = document.body.getBoundingClientRect();
    const topPercent = (top / bodyRect.height) * 100;
    const leftPercent = (left / bodyRect.width) * 100;

    setPortalPosition({
      top: topPercent,
      left: leftPercent,
    });
  };

  useEffect(() => {
    getPortalPosition();
  }, []);

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${
        (portalPosition.top === 0 || portalPosition.left === 0) && "opacity-0"
      } absolute z-20 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md`}
      style={{
        top: `${portalPosition.top}%`,
        left: `${portalPosition.left}%`,
      }}
      variants={AudioEffectsSectionVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={AudioEffectsSectionTransition}
    >
      <button
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        onClick={() => {
          userMedia.current.audio?.changeEffects("mute", false);
        }}
      >
        <FgSVG
          src={muteIcon}
          className='flex items-center justify-center'
          attributes={[
            { key: "width", value: "90%" },
            { key: "height", value: "90%" },
            { key: "fill", value: "white" },
            { key: "stroke", value: "white" },
          ]}
        />
      </button>
      <button
        id='audioEffectSection_mix_button'
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        onClick={() => {
          setAudioMixEffectsActive((prev) => !prev);
        }}
      >
        <FgSVG
          src={
            audioMixEffectsActive ? mixAudioEffectsOffIcon : mixAudioEffectsIcon
          }
          className='flex items-center justify-center'
          attributes={[
            { key: "width", value: "90%" },
            { key: "height", value: "90%" },
            { key: "fill", value: "white" },
            { key: "stroke", value: "white" },
          ]}
        />
      </button>
      <button
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        onClick={() => {
          userMedia.current.audio?.changeEffects("robot", false);
        }}
      >
        <FgSVG
          src={robotIcon}
          className='flex items-center justify-center'
          attributes={[
            { key: "width", value: "90%" },
            { key: "height", value: "90%" },
            { key: "fill", value: "white" },
            { key: "stroke", value: "white" },
          ]}
        />
      </button>
    </motion.div>,
    document.body
  );
}
