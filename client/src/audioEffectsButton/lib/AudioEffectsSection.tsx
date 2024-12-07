import React, { useState, useEffect, useRef, Suspense } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../../context/streamsContext/typeConstant";
import FgPanel from "../../fgElements/fgPanel/FgPanel";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgSVG from "../../fgElements/fgSVG/FgSVG";
import AudioEffectButton from "./AudioEffectButton";
import { audioEffectTemplates } from "./typeConstant";
import FgBackgroundMusicPortal from "../../fgBackgroundMusicPortal/FgBackgroundMusicPortal";

import VolumeSVG from "../../fgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../fgVolumeElement/lib/volumeSVGPaths";
import mixAudioEffectsIcon from "../../../public/svgs/audioEffects/mixAudioEffectsIcon.svg";
import mixAudioEffectsOffIcon from "../../../public/svgs/audioEffects/mixAudioEffectsOffIcon.svg";
import pianoIcon from "../../../public/svgs/audioEffects/pianoIcon.svg";
import pianoOffIcon from "../../../public/svgs/audioEffects/pianoOffIcon.svg";
import soundBoardIcon from "../../../public/svgs/audioEffects/soundBoardIcon.svg";
import soundBoardOffIcon from "../../../public/svgs/audioEffects/soundBoardOffIcon.svg";
import backgroundMusicIcon from "../../../public/svgs/audioEffects/backgroundMusicIcon.svg";
import backgroundMusicOffIcon from "../../../public/svgs/audioEffects/backgroundMusicOffIcon.svg";

const AudioMixEffectsPortal = React.lazy(
  () => import("./AudioMixEffectsPortal")
);
const FgPiano = React.lazy(() => import("../../fgPiano/FgPiano"));
const FgSoundBoard = React.lazy(
  () => import("../../fgSoundBoard/FgSoundBoard")
);

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
  visualMediaContainerRef,
  closeLabelElement,
  closeCallback,
  backgroundColor,
  secondaryBackgroundColor,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  isUser: boolean;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
  placement: "above" | "below" | "left" | "right";
  referenceElement: React.RefObject<HTMLElement>;
  padding: number;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
  visualMediaContainerRef?: React.RefObject<HTMLDivElement>;
  closeLabelElement?: React.ReactElement;
  closeCallback?: () => void;
  backgroundColor?: string;
  secondaryBackgroundColor?: string;
}) {
  const [_, setRerender] = useState(false);
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
  const [soundBoardActive, setSoundBoardActive] = useState(false);
  const [backgroundMusicActive, setBackgroundMusicActive] = useState(false);

  const audioSectionRef = useRef<HTMLDivElement>(null);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);
  const pianoRef = useRef<HTMLButtonElement>(null);
  const soundBoardButtonRef = useRef<HTMLButtonElement>(null);
  const backgroundMusicButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleMessage = (event: {
    type: "effectChangeRequested" | "clientEffectChanged";
  }) => {
    switch (event.type) {
      case "effectChangeRequested":
        setRerender((prev) => !prev);
        break;
      case "clientEffectChanged":
        setRerender((prev) => !prev);
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

  const audioEffectChange = (effect: AudioEffectTypes) => {
    handleAudioEffectChange(effect);

    setRerender((prev) => !prev);
  };

  const closeSoundBoardCallback = () => {
    setSoundBoardActive(false);
  };

  const closeBackgroundMusicCallback = () => {
    setBackgroundMusicActive(false);
  };

  return (
    <>
      <FgPanel
        content={
          <div
            ref={audioSectionRef}
            className={`small-vertical-scroll-bar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
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
                if (visualMediaContainerRef?.current) {
                  if (
                    visualMediaContainerRef.current.classList.contains(
                      "in-piano"
                    )
                  ) {
                    visualMediaContainerRef.current.classList.remove(
                      "in-piano"
                    );
                  } else {
                    visualMediaContainerRef.current.classList.add("in-piano");
                  }
                }
                setPanioActive((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={panioActive ? pianoOffIcon : pianoIcon}
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
            <FgButton
              scrollingContainerRef={audioSectionRef}
              externalRef={soundBoardButtonRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                setSoundBoardActive((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={soundBoardActive ? soundBoardOffIcon : soundBoardIcon}
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
                  {soundBoardActive ? "Close sound board" : "Sound board"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              scrollingContainerRef={audioSectionRef}
              externalRef={backgroundMusicButtonRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                setBackgroundMusicActive((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={
                      backgroundMusicActive
                        ? backgroundMusicOffIcon
                        : backgroundMusicIcon
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
                  {backgroundMusicActive
                    ? "Close background music"
                    : "Background music"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            {Object.entries(audioEffectTemplates).map((effect) => {
              return (
                <AudioEffectButton
                  key={effect[0]}
                  username={username}
                  instance={instance}
                  isUser={isUser}
                  audioEffect={effect[0] as AudioEffectTypes}
                  audioEffectTemplate={effect[1]}
                  scrollingContainerRef={audioSectionRef}
                  handleAudioEffectChange={audioEffectChange}
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
        initWidth={"278px"}
        initHeight={"268px"}
        minWidth={204}
        minHeight={190}
        resizeCallback={gridColumnsChange}
        closeCallback={closeCallback ? () => closeCallback() : undefined}
        closeLabelElement={closeLabelElement}
        closePosition='topRight'
        shadow={{ top: true, bottom: true }}
        backgroundColor={backgroundColor}
        secondaryBackgroundColor={secondaryBackgroundColor}
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
      {soundBoardActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgSoundBoard
            soundBoardButtonRef={soundBoardButtonRef.current ?? undefined}
            closeCallback={closeSoundBoardCallback}
          />
        </Suspense>
      )}
      {backgroundMusicActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgBackgroundMusicPortal
            closeCallback={closeBackgroundMusicCallback}
            backgroundMusicButtonRef={backgroundMusicButtonRef}
          />
        </Suspense>
      )}
    </>
  );
}
