import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
import { useStreamsContext } from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import muteIcon from "../../../public/svgs/audio/muteIcon.svg";
import mixAudioEffectsIcon from "../../../public/svgs/mixAudioEffectsIcon.svg";
import mixAudioEffectsOffIcon from "../../../public/svgs/mixAudioEffectsOffIcon.svg";
import robotIcon from "../../../public/svgs/audio/robotIcon.svg";
import robotOffIcon from "../../../public/svgs/audio/robotOffIcon.svg";
import echoIcon from "../../../public/svgs/audio/echoIcon.svg";
import echoOffIcon from "../../../public/svgs/audio/echoOffIcon.svg";
import alienIcon from "../../../public/svgs/audio/alienIcon.svg";
import alienOffIcon from "../../../public/svgs/audio/alienOffIcon.svg";
import underwaterIcon from "../../../public/svgs/audio/underwaterIcon.svg";
import underwaterOffIcon from "../../../public/svgs/audio/underwaterOffIcon.svg";
import telephoneIcon from "../../../public/svgs/audio/telephoneIcon.svg";
import telephoneOffIcon from "../../../public/svgs/audio/telephoneOffIcon.svg";

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
  audioMixEffectsButtonRef,
}: {
  type: "above" | "below";
  buttonRef: React.RefObject<HTMLButtonElement>;
  audioMixEffectsActive: boolean;
  setAudioMixEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  audioMixEffectsButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const { userMedia, userStreamEffects } = useStreamsContext();
  const [rerender, setRerender] = useState(false);
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
      <FgButton
        externalRef={audioMixEffectsButtonRef}
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        clickFunction={() => {
          setAudioMixEffectsActive((prev) => !prev);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                audioMixEffectsActive
                  ? mixAudioEffectsOffIcon
                  : mixAudioEffectsIcon
              }
              className='flex items-center justify-center'
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
                { key: "fill", value: "white" },
                { key: "stroke", value: "white" },
              ]}
            />
          );
        }}
      />
      <FgButton
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        clickFunction={() => {
          userMedia.current.audio?.changeEffects("robot", false);
          setRerender((prev) => !prev);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                userStreamEffects.current.audio.robot ? robotOffIcon : robotIcon
              }
              className='flex items-center justify-center'
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
                { key: "fill", value: "white" },
                { key: "stroke", value: "white" },
                ...(userStreamEffects.current.audio.robot
                  ? [{ key: "fill", value: "red", id: "eyes" }]
                  : []),
              ]}
            />
          );
        }}
      />
      <FgButton
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        clickFunction={() => {
          userMedia.current.audio?.changeEffects("echo", false);
          setRerender((prev) => !prev);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                userStreamEffects.current.audio.echo ? echoOffIcon : echoIcon
              }
              className='flex items-center justify-center'
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
                {
                  key: "fill",
                  value: userStreamEffects.current.audio.echo
                    ? "white"
                    : "none",
                },
                { key: "stroke", value: "white" },
              ]}
            />
          );
        }}
      />
      <FgButton
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        clickFunction={() => {
          userMedia.current.audio?.changeEffects("alien", false);
          setRerender((prev) => !prev);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                userStreamEffects.current.audio.alien ? alienOffIcon : alienIcon
              }
              className='flex items-center justify-center'
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
              ]}
            />
          );
        }}
      />
      <FgButton
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        clickFunction={() => {
          userMedia.current.audio?.changeEffects("underwater", false);
          setRerender((prev) => !prev);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                userStreamEffects.current.audio.underwater
                  ? underwaterOffIcon
                  : underwaterIcon
              }
              className='flex items-center justify-center'
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
                { key: "fill", value: "white" },
                { key: "stroke", value: "white" },
              ]}
            />
          );
        }}
      />
      <FgButton
        className='border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75'
        clickFunction={() => {
          userMedia.current.audio?.changeEffects("telephone", false);
          setRerender((prev) => !prev);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                userStreamEffects.current.audio.telephone
                  ? telephoneOffIcon
                  : telephoneIcon
              }
              className='flex items-center justify-center'
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
                { key: "fill", value: "white" },
                { key: "stroke", value: "white" },
              ]}
            />
          );
        }}
      />
    </motion.div>,
    document.body
  );
}
