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
import VolumeSVG from "../../FgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../FgVolumeElement/lib/volumeSVGPaths";
import FgPanel from "../../fgPanel/FgPanel";
import AudioMixEffectsPortal from "./AudioMixEffectsPortal";

export default function AudioEffectsSection({
  type,
  referenceElement,
  padding,
  handleMute,
  muteStateRef,
}: {
  type: "above" | "below" | "left" | "right";
  referenceElement: React.RefObject<HTMLElement>;
  padding: number;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
}) {
  const { userMedia, userStreamEffects } = useStreamsContext();

  const [audioMixEffectsActive, setAudioMixEffectsActive] = useState(false);
  const [volumeState, setVolumeState] = useState<{
    from: "off" | "low" | "high" | "";
    to: "off" | "low" | "high";
  }>({
    from: "",
    to: muteStateRef.current ? "off" : "high",
  });
  const [rerender, setRerender] = useState(false);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const newTo = muteStateRef.current ? "off" : "high";

    if (newTo !== volumeState.to) {
      setVolumeState((prev) => ({ from: prev.to, to: newTo }));
    }
  }, [muteStateRef.current]);

  return (
    <>
      <FgPanel
        content={
          <div className='grid grid-cols-3 gap-x-1 gap-y-1 p-2 min-w-[12rem] min-h-[12rem] h-full w-full'>
            <FgButton
              className='border-gray-300 flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                setVolumeState((prev) => ({
                  from: prev.to,
                  to: muteStateRef.current ? "high" : "off",
                }));
                handleMute();
              }}
              contentFunction={() => (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 100.0001 100.00001'
                  width='90%'
                  height='90%'
                  fill='white'
                >
                  <VolumeSVG
                    volumeState={volumeState}
                    movingPath={volumeSVGPaths.low.right}
                    stationaryPaths={[
                      volumeSVGPaths.high.left,
                      volumeSVGPaths.high.middle,
                    ]}
                    color='white'
                  />
                  {volumeState.from === "" && volumeState.to === "off" && (
                    <path d={volumeSVGPaths.strike} />
                  )}
                </svg>
              )}
            />
            <FgButton
              externalRef={audioMixEffectsButtonRef}
              className='border-gray-300 flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              className='border-gray-300 flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                userMedia.current.audio?.changeEffects("robot", false);
                setRerender((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={
                      userStreamEffects.current.audio.robot
                        ? robotOffIcon
                        : robotIcon
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
              className='border-gray-300 flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                userMedia.current.audio?.changeEffects("echo", false);
                setRerender((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={
                      userStreamEffects.current.audio.echo
                        ? echoOffIcon
                        : echoIcon
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
              className='border-gray-300 flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                userMedia.current.audio?.changeEffects("alien", false);
                setRerender((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={
                      userStreamEffects.current.audio.alien
                        ? alienOffIcon
                        : alienIcon
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
              className='border-gray-300 flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              className='border-gray-300 flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
          </div>
        }
        initPosition={{
          referenceElement: referenceElement.current ?? undefined,
          placement: type,
          padding: padding,
        }}
        initWidth={232}
        initHeight={232}
        minWidth={232}
        minHeight={232}
      />
      {audioMixEffectsActive && (
        <AudioMixEffectsPortal
          audioMixEffectsButtonRef={audioMixEffectsButtonRef}
        />
      )}
    </>
  );
}
