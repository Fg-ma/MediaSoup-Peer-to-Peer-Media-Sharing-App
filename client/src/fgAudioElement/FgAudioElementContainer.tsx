import React, { useRef, useState } from "react";
import FgAudioElement from "./FgAudioElement";
import AudioEffectsSection from "../audioEffectsButton/lib/AudioEffectsSection";
import FgPortal from "../fgPortal/FgPortal";

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
