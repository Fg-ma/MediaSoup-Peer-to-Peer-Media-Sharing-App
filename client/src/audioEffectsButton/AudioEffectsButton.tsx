import React, { Suspense, useRef } from "react";
import { AudioEffectTypes } from "../../../universal/effectsTypeConstant";
import { Permissions } from "../context/permissionsContext/lib/typeConstant";
import FgButton from "../elements/fgButton/FgButton";
import FgSVGElement from "../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const audioEffectIcon =
  nginxAssetServerBaseUrl + "svgs/audioEffects/audioEffectIcon.svg";
const audioEffectOffIcon =
  nginxAssetServerBaseUrl + "svgs/audioEffects/audioEffectOffIcon.svg";

const AudioEffectsSection = React.lazy(
  () => import("./lib/AudioEffectsSection"),
);

const defaultAudioEffectsButtonOptions: {
  color: string;
  placement: "above" | "below" | "left" | "right";
  hoverTimeoutDuration: number;
} = { color: "#f2f2f2", placement: "above", hoverTimeoutDuration: 0 };

export default function AudioEffectsButton({
  tableId,
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
  videoContentMute,
  clientMute,
  screenAudioClientMute,
  localMute,
  screenAudioLocalMute,
  visualMediaContainerRef,
  closeLabelElement,
  hoverLabelElement,
  scrollingContainerRef,
  style,
  options,
}: {
  tableId: string;
  username: string;
  instance: string;
  isUser: boolean;
  permissions: Permissions | undefined;
  producerType: "audio" | "screenAudio" | "video";
  producerId: string | undefined;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio" | "video",
    producerId: string | undefined,
    effect: AudioEffectTypes,
  ) => void;
  handleMute: (
    producerType: "audio" | "screenAudio" | "video",
    producerId: string | undefined,
  ) => void;
  muteStateRef?: React.MutableRefObject<boolean>;
  videoContentMute?: React.MutableRefObject<{
    [producerId: string]: boolean;
  }>;
  clientMute?: React.MutableRefObject<boolean>;
  screenAudioClientMute?: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  localMute?: React.MutableRefObject<boolean>;
  screenAudioLocalMute?: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
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
    hoverTimeoutDuration?: number;
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
            <FgSVGElement
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
                <FgHoverContentStandard content="Audio effects" style="dark" />
              )}
            </>
          ) : (
            <></>
          )
        }
        scrollingContainerRef={scrollingContainerRef}
        className="pointer-events-auto flex aspect-square h-full items-center justify-center"
        style={style}
        options={{
          hoverTimeoutDuration: audioEffectsButtonOptions.hoverTimeoutDuration,
        }}
      />
      {audioEffectsActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioEffectsSection
            tableId={tableId}
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
            clientMute={clientMute}
            screenAudioClientMute={screenAudioClientMute}
            localMute={localMute}
            screenAudioLocalMute={screenAudioLocalMute}
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
