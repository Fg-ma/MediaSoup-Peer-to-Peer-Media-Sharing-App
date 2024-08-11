import React, { useRef, useState } from "react";
import FgAudioElement from "./FgAudioElement";
import AudioEffectsSection from "../audioEffectsButton/lib/AudioEffectsSection";

export default function FgAudioElementContainer({
  audioStream,
  audioRef,
  username,
  name,
  handleMute,
  clientMute,
  localMute,
  isUser,
  options,
}: {
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  username: string;
  name?: string;
  handleMute: () => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser?: boolean;
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
  const audioElementSVGRef = useRef<SVGSVGElement>(null);
  const [audioEffectsSectionVisible, setAudioEffectsSectionVisible] =
    useState(false);

  return (
    <>
      <FgAudioElement
        svgRef={audioElementSVGRef}
        audioStream={audioStream}
        audioRef={audioRef}
        username={username}
        name={name}
        handleMute={handleMute}
        clientMute={clientMute}
        localMute={localMute}
        isUser={isUser}
        doubleClickFunction={() => {
          setAudioEffectsSectionVisible((prev) => !prev);
        }}
        options={options}
      />
      {audioEffectsSectionVisible && (
        <AudioEffectsSection
          type='right'
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
