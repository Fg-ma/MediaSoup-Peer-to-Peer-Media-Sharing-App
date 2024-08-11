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
  closeCallback,
}: {
  type: "above" | "below" | "left" | "right";
  referenceElement: React.RefObject<HTMLElement>;
  padding: number;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
  closeCallback?: () => void;
}) {
  const { userMedia, userStreamEffects } = useStreamsContext();

  const [rerender, setRerender] = useState(false);
  const [cols, setCols] = useState(3);
  const [volumeState, setVolumeState] = useState<{
    from: "off" | "low" | "high" | "";
    to: "off" | "low" | "high";
  }>({
    from: "",
    to: muteStateRef.current ? "off" : "high",
  });
  const [audioMixEffectsActive, setAudioMixEffectsActive] = useState(false);
  const audioSectionRef = useRef<HTMLDivElement>(null);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const newTo = muteStateRef.current ? "off" : "high";

    if (newTo !== volumeState.to) {
      setVolumeState((prev) => ({ from: prev.to, to: newTo }));
    }
  }, [muteStateRef.current]);

  const gridColumnsChange = () => {
    if (!audioSectionRef.current) return;

    const width = audioSectionRef.current.clientWidth;
    if (width < 300) {
      if (cols !== 3) setCols(3);
    } else if (width < 500) {
      if (cols !== 4) setCols(4);
    } else if (width < 700) {
      if (cols !== 5) setCols(5);
    } else if (width >= 700) {
      if (cols !== 6) setCols(6);
    }
  };

  return (
    <>
      <FgPanel
        content={
          <div
            ref={audioSectionRef}
            className={`grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto ${
              cols === 3
                ? "grid-cols-3"
                : cols === 4
                ? "grid-cols-4"
                : cols === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            }`}
          >
            <FgButton
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {muteStateRef.current ? "Unmute" : "Mute"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              externalRef={audioMixEffectsButtonRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {audioMixEffectsActive ? "Close mix effects" : "Mix effects"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {userStreamEffects.current.audio.robot
                    ? "Remove robot effect"
                    : "Robot effect"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {userStreamEffects.current.audio.echo
                    ? "Remove echo effect"
                    : "Echo effect"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {userStreamEffects.current.audio.alien
                    ? "Remove alien effect"
                    : "Alien effect"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {userStreamEffects.current.audio.underwater
                    ? "Remove underwater effect"
                    : "Underwater effect"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {userStreamEffects.current.audio.telephone
                    ? "Remove telephone effect"
                    : "Telephone effect"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
          </div>
        }
        initPosition={{
          referenceElement: referenceElement.current ?? undefined,
          placement: type,
          padding: padding,
        }}
        initWidth={176}
        initHeight={176}
        minWidth={176}
        minHeight={176}
        resizeCallback={() => {
          gridColumnsChange();
        }}
        closeCallback={closeCallback ? () => closeCallback() : undefined}
        closePosition='topRight'
      />
      {audioMixEffectsActive && (
        <AudioMixEffectsPortal
          audioMixEffectsButtonRef={audioMixEffectsButtonRef}
          closeCallback={() => {
            setAudioMixEffectsActive(false);
          }}
        />
      )}
    </>
  );
}
