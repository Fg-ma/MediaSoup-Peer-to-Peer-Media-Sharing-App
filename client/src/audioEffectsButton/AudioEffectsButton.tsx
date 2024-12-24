import React, { Suspense, useRef } from "react";
import { AudioEffectTypes } from "../context/effectsContext/typeConstant";
import { Permissions } from "../context/permissionsContext/typeConstant";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../fgElements/fgHoverContentStandard/FgHoverContentStandard";

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
  table_id,
  username,
  instance,
  isUser,
  permissions,
  producerType,
  producerId,
  audioEffectsActive,
  setAudioEffectsActive,
  handleAudioEffectChange,
  handleMute,
  muteStateRef,
  localMute,
  clientMute,
  visualMediaContainerRef,
  closeLabelElement,
  hoverLabelElement,
  scrollingContainerRef,
  style,
  options,
}: {
  table_id: string;
  username: string;
  instance: string;
  isUser: boolean;
  permissions: Permissions;
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
  muteStateRef?: React.MutableRefObject<boolean>;
  localMute?: React.MutableRefObject<boolean>;
  clientMute?: React.MutableRefObject<boolean>;
  visualMediaContainerRef?: React.RefObject<HTMLDivElement>;
  closeLabelElement?: React.ReactElement;
  hoverLabelElement?: React.ReactElement;
  scrollingContainerRef?: React.RefObject<HTMLDivElement>;
  style?: React.CSSProperties;
  options?: {
    color?: string;
    placement?: "above" | "below" | "left" | "right";
    backgroundColor?: string;
    secondaryBackgroundColor?: string;
  };
}) {
  const audioEffectsButtonOptions = {
    ...defaultAudioEffectsButtonOptions,
    ...options,
  };

  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={buttonRef}
        clickFunction={async () => {
          setAudioEffectsActive((prev) => !prev);
        }}
        contentFunction={() => {
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
                <FgHoverContentStandard content='Audio effects' style='dark' />
              )}
            </>
          ) : (
            <></>
          )
        }
        scrollingContainerRef={scrollingContainerRef}
        className='flex items-center justify-center w-10 min-w-10 aspect-square pointer-events-auto'
        style={style}
      />
      {audioEffectsActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioEffectsSection
            table_id={table_id}
            username={username}
            instance={instance}
            isUser={isUser}
            permissions={permissions}
            producerType={producerType}
            producerId={producerId}
            handleAudioEffectChange={handleAudioEffectChange}
            placement={audioEffectsButtonOptions.placement}
            referenceElement={buttonRef}
            padding={12}
            handleMute={handleMute}
            muteStateRef={muteStateRef}
            localMute={localMute}
            clientMute={clientMute}
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
