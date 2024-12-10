import React, { Suspense, useRef } from "react";
import { Socket } from "socket.io-client";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import { AudioEffectTypes } from "../context/streamsContext/typeConstant";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";
import audioEffectIcon from "../../public/svgs/audioEffects/audioEffectIcon.svg";
import audioEffectOffIcon from "../../public/svgs/audioEffects/audioEffectOffIcon.svg";

const AudioEffectsSection = React.lazy(
  () => import("./lib/AudioEffectsSection")
);

const defaultAudioEffectsButtonOptions: {
  color: string;
  placement: "above" | "below" | "left" | "right";
} = { color: "white", placement: "above" };

export default function AudioEffectsButton({
  socket,
  username,
  instance,
  isUser,
  producerType,
  producerId,
  audioEffectsActive,
  setAudioEffectsActive,
  handleAudioEffectChange,
  handleMute,
  muteStateRef,
  visualMediaContainerRef,
  closeLabelElement,
  hoverLabelElement,
  options,
  style,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  isUser: boolean;
  producerType: "audio" | "screenAudio";
  producerId: string | undefined;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => void;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
  visualMediaContainerRef?: React.RefObject<HTMLDivElement>;
  closeLabelElement?: React.ReactElement;
  hoverLabelElement?: React.ReactElement;
  options?: {
    color?: string;
    placement?: "above" | "below" | "left" | "right";
    backgroundColor?: string;
    secondaryBackgroundColor?: string;
  };
  style?: React.CSSProperties;
}) {
  const audioEffectsButtonOptions = {
    ...defaultAudioEffectsButtonOptions,
    ...options,
  };

  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={buttonRef}
        clickFunction={async () => {
          setAudioEffectsActive((prev) => !prev);
        }}
        contentFunction={() => {
          if (!currentEffectsStyles.current.audio) {
            return;
          }

          return (
            <FgSVG
              src={audioEffectsActive ? audioEffectOffIcon : audioEffectIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: audioEffectsButtonOptions.color },
              ]}
            />
          );
        }}
        hoverContent={
          !audioEffectsActive ? (
            <>
              {hoverLabelElement ? (
                hoverLabelElement
              ) : (
                <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
                  Audio effects
                </div>
              )}
            </>
          ) : (
            <></>
          )
        }
        className='flex items-center justify-center w-10 min-w-10 aspect-square pointer-events-auto'
        style={style}
      />
      {audioEffectsActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioEffectsSection
            socket={socket}
            username={username}
            instance={instance}
            isUser={isUser}
            producerType={producerType}
            producerId={producerId}
            handleAudioEffectChange={handleAudioEffectChange}
            placement={audioEffectsButtonOptions.placement}
            referenceElement={buttonRef}
            padding={12}
            handleMute={handleMute}
            muteStateRef={muteStateRef}
            visualMediaContainerRef={visualMediaContainerRef}
            closeLabelElement={closeLabelElement}
            closeCallback={() => setAudioEffectsActive(false)}
            backgroundColor={audioEffectsButtonOptions.backgroundColor}
            secondaryBackgroundColor={
              audioEffectsButtonOptions.secondaryBackgroundColor
            }
          />
        </Suspense>
      )}
    </>
  );
}
