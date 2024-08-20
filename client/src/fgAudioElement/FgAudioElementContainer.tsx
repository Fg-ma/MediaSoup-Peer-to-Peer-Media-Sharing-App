import React, { useRef, useState } from "react";
import FgAudioElement from "./FgAudioElement";
import AudioEffectsSection from "../audioEffectsButton/lib/AudioEffectsSection";
import FgPortal from "../fgPortal/FgPortal";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "src/context/StreamsContext";

export default function FgAudioElementContainer({
  socket,
  table_id,
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
  table_id: string;
  username: string;
  instance: string;
  name?: string;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
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
        <FgPortal
          type='mouse'
          content={
            <div className='w-max h-max shadow-lg px-4 py-2 rounded-md text-lg font-Josefin relative z-[50] bg-white'>
              {name ? name : username}
            </div>
          }
        />
      )}
      {audioEffectsSectionVisible && (
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
      )}
    </>
  );
}
