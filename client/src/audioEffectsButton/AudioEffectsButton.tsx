import React, { useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../context/StreamsContext";
import { useCurrentEffectsStylesContext } from "../context/CurrentEffectsStylesContext";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import AudioEffectsSection from "./lib/AudioEffectsSection";
import audioEffectIcon from "../../public/svgs/audioEffectIcon.svg";
import audioEffectOffIcon from "../../public/svgs/audioEffectOffIcon.svg";

const defaultAudioEffectsButtonOptions: {
  color: string;
  placement: "above" | "below" | "left" | "right";
} = { color: "white", placement: "above" };

export default function AudioEffectsButton({
  socket,
  username,
  instance,
  isUser,
  handleAudioEffectChange,
  handleMute,
  muteStateRef,
  options,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  isUser: boolean;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
  options?: {
    color?: string;
    placement?: "above" | "below" | "left" | "right";
  };
}) {
  const audioEffectsButtonOptions = {
    ...defaultAudioEffectsButtonOptions,
    ...options,
  };

  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const [effectSectionActive, setEffectSectionActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={buttonRef}
        clickFunction={async () => {
          setEffectSectionActive((prev) => !prev);
        }}
        contentFunction={() => {
          if (!currentEffectsStyles.current.audio) {
            return;
          }

          return (
            <FgSVG
              src={effectSectionActive ? audioEffectOffIcon : audioEffectIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: audioEffectsButtonOptions.color },
              ]}
            />
          );
        }}
        hoverContent={
          !effectSectionActive ? (
            <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Audio Effects
            </div>
          ) : (
            <></>
          )
        }
        className='flex items-center justify-center w-10 min-w-10 aspect-square'
      />
      {effectSectionActive && (
        <AudioEffectsSection
          socket={socket}
          username={username}
          instance={instance}
          isUser={isUser}
          handleAudioEffectChange={handleAudioEffectChange}
          placement={audioEffectsButtonOptions.placement}
          referenceElement={buttonRef}
          padding={12}
          handleMute={handleMute}
          muteStateRef={muteStateRef}
          closeCallback={() => setEffectSectionActive(false)}
        />
      )}
    </>
  );
}
