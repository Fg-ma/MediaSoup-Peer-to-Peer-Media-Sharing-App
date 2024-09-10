import React, { useState, useEffect, useRef, Suspense } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../../context/StreamsContext";
import FgPanel from "../../fgPanel/FgPanel";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import mixAudioEffectsIcon from "../../../public/svgs/audio/mixAudioEffectsIcon.svg";
import mixAudioEffectsOffIcon from "../../../public/svgs/audio/mixAudioEffectsOffIcon.svg";
import panioIcon from "../../../public/svgs/audio/panioIcon.svg";
import panioOffIcon from "../../../public/svgs/audio/panioOffIcon.svg";
import VolumeSVG from "../../FgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../FgVolumeElement/lib/volumeSVGPaths";
import AudioEffectButton from "./AudioEffectButton";

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
import spaceIcon from "../../../public/svgs/audio/spaceIcon.svg";
import spaceOffIcon from "../../../public/svgs/audio/spaceOffIcon.svg";
import distortionIcon from "../../../public/svgs/audio/distortionIcon.svg";
import distortionOffIcon from "../../../public/svgs/audio/distortionOffIcon.svg";
import vintageIcon from "../../../public/svgs/audio/vintageIcon.svg";
import VintageOffIcon from "../../../public/svgs/audio/vintageOffIcon.svg";

const AudioMixEffectsPortal = React.lazy(
  () => import("./AudioMixEffectsPortal")
);
const FgPiano = React.lazy(() => import("../../FgPanio/FgPiano"));

export type AudioEffectTemplate = {
  icon: string;
  offIcon: string;
  attributes: {
    key: string;
    value: string;
    activityDependentValue?: {
      active: string;
      deactive: string;
    };
    id?: string;
  }[];
  hoverContent: {
    active: string;
    deactive: string;
  };
};

export type AudioEffectTemplates = {
  [audioEffectType in AudioEffectTypes]: AudioEffectTemplate;
};

const audioEffectTemplates: AudioEffectTemplates = {
  robot: {
    icon: robotIcon,
    offIcon: robotOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        id: "eyes",
        value: "red",
        activityDependentValue: { active: "", deactive: "red" },
      },
    ],
    hoverContent: { active: "Robot effect", deactive: "Remove robot effect" },
  },
  echo: {
    icon: echoIcon,
    offIcon: echoOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        value: "white",
        activityDependentValue: { active: "none", deactive: "white" },
      },
    ],
    hoverContent: { active: "Echo effect", deactive: "Remove echo effect" },
  },
  alien: {
    icon: alienIcon,
    offIcon: alienOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: { active: "Alien effect", deactive: "Remove alien effect" },
  },
  underwater: {
    icon: underwaterIcon,
    offIcon: underwaterOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Underwater effect",
      deactive: "Remove underwater effect",
    },
  },
  telephone: {
    icon: telephoneIcon,
    offIcon: telephoneOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Telephone effect",
      deactive: "Remove telephone effect",
    },
  },
  space: {
    icon: spaceIcon,
    offIcon: spaceOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Space effect",
      deactive: "Remove space effect",
    },
  },
  distortion: {
    icon: distortionIcon,
    offIcon: distortionOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Distortion effect",
      deactive: "Remove distortion effect",
    },
  },
  vintage: {
    icon: vintageIcon,
    offIcon: VintageOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        id: "center",
        value: "#f56114",
        activityDependentValue: { active: "none", deactive: "#f56114" },
      },
    ],
    hoverContent: {
      active: "Vintage effect",
      deactive: "Remove vintage effect",
    },
  },
  psychedelic: {
    icon: "",
    offIcon: "",
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Psychedelic effect",
      deactive: "Remove psychedelic effect",
    },
  },
  deepBass: {
    icon: "",
    offIcon: "",
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Deep bass effect",
      deactive: "Remove deep bass effect",
    },
  },
  highEnergy: {
    icon: "",
    offIcon: "",
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "High energy effect",
      deactive: "Remove high energy effect",
    },
  },
  ambient: {
    icon: "",
    offIcon: "",
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Ambient effect",
      deactive: "Remove ambient effect",
    },
  },
  glitch: {
    icon: "",
    offIcon: "",
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Glitch effect",
      deactive: "Remove glitch effect",
    },
  },
};

export default function AudioEffectsSection({
  socket,
  username,
  instance,
  isUser,
  handleAudioEffectChange,
  placement,
  referenceElement,
  padding,
  handleMute,
  muteStateRef,
  closeCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  isUser: boolean;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
  placement: "above" | "below" | "left" | "right";
  referenceElement: React.RefObject<HTMLElement>;
  padding: number;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
  closeCallback?: () => void;
}) {
  const [rerender, setRerender] = useState(0);
  const [cols, setCols] = useState(3);
  const [volumeState, setVolumeState] = useState<{
    from: "off" | "low" | "high" | "";
    to: "off" | "low" | "high";
  }>({
    from: "",
    to: muteStateRef.current ? "off" : "high",
  });
  const [audioMixEffectsActive, setAudioMixEffectsActive] = useState(false);
  const [panioActive, setPanioActive] = useState(false);

  const audioSectionRef = useRef<HTMLDivElement>(null);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);
  const pianoRef = useRef<HTMLButtonElement>(null);

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

  const handleMessage = (event: any) => {
    switch (event.type) {
      case "effectChangeRequested":
        setRerender((prev) => prev + 1);
        break;
      case "clientEffectChanged":
        setRerender((prev) => prev + 1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    socket.current.on("message", handleMessage);

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", handleMessage);
    };
  }, []);

  return (
    <>
      <FgPanel
        content={
          <div
            ref={audioSectionRef}
            className={`smallScrollbar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
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
              scrollingContainerRef={audioSectionRef}
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
              scrollingContainerRef={audioSectionRef}
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
              scrollingContainerRef={audioSectionRef}
              externalRef={pianoRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                setPanioActive((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={panioActive ? panioOffIcon : panioIcon}
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
                  {panioActive ? "Close synth" : "Synth"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            {Object.entries(audioEffectTemplates).map((effect) => {
              return (
                <AudioEffectButton
                  username={username}
                  instance={instance}
                  isUser={isUser}
                  audioEffect={effect[0] as AudioEffectTypes}
                  audioEffectTemplate={effect[1]}
                  scrollingContainerRef={audioSectionRef}
                  handleAudioEffectChange={handleAudioEffectChange}
                />
              );
            })}
          </div>
        }
        initPosition={{
          referenceElement: referenceElement.current ?? undefined,
          placement: placement,
          padding: padding,
        }}
        initWidth={"204px"}
        initHeight={"190px"}
        minWidth={204}
        minHeight={190}
        resizeCallback={() => {
          gridColumnsChange();
        }}
        closeCallback={closeCallback ? () => closeCallback() : undefined}
        closePosition='topRight'
        shadow={{ top: true, bottom: true }}
      />
      {audioMixEffectsActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioMixEffectsPortal
            audioMixEffectsButtonRef={audioMixEffectsButtonRef}
            closeCallback={() => {
              setAudioMixEffectsActive(false);
            }}
          />
        </Suspense>
      )}
      {panioActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgPiano
            isUser={isUser}
            closeCallback={() => {
              setPanioActive(false);
            }}
            referenceElement={pianoRef.current as HTMLElement}
          />
        </Suspense>
      )}
    </>
  );
}
