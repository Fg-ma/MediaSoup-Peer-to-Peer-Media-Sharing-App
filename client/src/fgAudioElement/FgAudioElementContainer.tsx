import React, { Suspense, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../context/streamsContext/typeConstant";
import FgAudioElement from "./FgAudioElement";

const FgPortal = React.lazy(() => import("../fgElements/fgPortal/FgPortal"));
const AudioEffectsSection = React.lazy(
  () => import("../audioEffectsButton/lib/AudioEffectsSection")
);

export default function FgAudioElementContainer({
  socket,
  username,
  instance,
  name,
  audioStream,
  audioRef,
  handleAudioEffectChange,
  handleMute,
  clientMute,
  localMute,
  isUser,
  options,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  name?: string;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
  handleMute: () => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser: boolean;
  options?: {
    springDuration?: number;
    noiseThreshold?: number;
    numFixedPoints?: number;
    bellCurveAmplitude?: number;
    bellCurveMean?: number;
    bellCurveStdDev?: number;
    shadowColor?: string;
    volumeColor?: string;
    primaryMuteColor?: string;
    secondaryMuteColor?: string;
    muteStyleOption?: "morse" | "smile";
  };
}) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [audioEffectsSectionVisible, setAudioEffectsSectionVisible] =
    useState(false);
  const audioElementSVGRef = useRef<SVGSVGElement>(null);

  return (
    <>
      <FgAudioElement
        svgRef={audioElementSVGRef}
        audioStream={audioStream}
        audioRef={audioRef}
        username={username}
        setPopupVisible={setPopupVisible}
        handleMute={handleMute}
        clientMute={clientMute}
        localMute={localMute}
        isUser={isUser}
        doubleClickFunction={() => {
          setAudioEffectsSectionVisible((prev) => !prev);
        }}
        options={options}
      />
      {popupVisible && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgPortal
            type='mouse'
            content={
              <div className='w-max h-max shadow-lg px-4 py-2 rounded-md text-lg font-Josefin relative z-[50] bg-white'>
                {name ? name : username}
              </div>
            }
          />
        </Suspense>
      )}
      {audioEffectsSectionVisible && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioEffectsSection
            socket={socket}
            username={username}
            instance={instance}
            isUser={isUser}
            handleAudioEffectChange={handleAudioEffectChange}
            placement='right'
            referenceElement={
              audioElementSVGRef as unknown as React.RefObject<HTMLElement>
            }
            padding={12}
            handleMute={handleMute}
            muteStateRef={localMute}
            closeCallback={() => setAudioEffectsSectionVisible(false)}
          />
        </Suspense>
      )}
    </>
  );
}
