import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import ProducersController from "../../../lib/ProducersController";
import AudioSectionController from "./lib/audioSectionController";
import volumeSVGPaths from "../../../elements/fgVolumeElement/lib/volumeSVGPaths";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const shareAudioIcon = nginxAssetServerBaseUrl + "svgs/shareAudioIcon.svg";
const removeAudioIcon = nginxAssetServerBaseUrl + "svgs/removeAudioIcon.svg";

const FgButton = React.lazy(
  () => import("../../../elements/fgButton/FgButton"),
);
const VolumeSVG = React.lazy(
  () => import("../../../elements/fgVolumeElement/lib/VolumeSVG"),
);

export default function AudioSection({
  audioBtnRef,
  muteBtnRef,
  mutedAudioRef,
  isAudio,
  audioActive,
  setAudioActive,
  handleExternalMute,
  producersController,
  handleDisableEnableBtns,
}: {
  audioBtnRef: React.RefObject<HTMLButtonElement>;
  muteBtnRef: React.RefObject<HTMLButtonElement>;
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  audioActive: boolean;
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleExternalMute: () => void;
  producersController: React.MutableRefObject<ProducersController>;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { mediasoupSocket } = useSocketContext();
  const { tableId, username, instance } = useUserInfoContext();

  const [volumeState, setVolumeState] = useState<{
    from: "off" | "low" | "high" | "";
    to: "off" | "low" | "high";
  }>({
    from: "",
    to: mutedAudioRef.current ? "off" : "high",
  });

  const audioSectionController = useRef(
    new AudioSectionController(
      mediasoupSocket,
      tableId,
      username,
      instance,
      producersController,
      isAudio,
      setAudioActive,
      handleDisableEnableBtns,
    ),
  );

  useEffect(() => {
    const newTo = mutedAudioRef.current ? "off" : "high";

    if (newTo !== volumeState.to) {
      setVolumeState((prev) => ({ from: prev.to, to: newTo }));
    }
  }, [mutedAudioRef.current]);

  return (
    <div className="flex h-full space-x-4">
      <FgButton
        externalRef={audioBtnRef}
        clickFunction={() => audioSectionController.current.shareAudio()}
        className="relative flex aspect-square h-full items-center justify-center rounded-full hover:border-2 hover:border-fg-off-white disabled:opacity-25"
        contentFunction={() => {
          if (audioActive) {
            return (
              <FgSVGElement
                src={removeAudioIcon}
                className="aspect-square h-[80%]"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                ]}
              />
            );
          } else {
            return (
              <FgSVGElement
                src={shareAudioIcon}
                className="aspect-square h-[80%]"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                ]}
              />
            );
          }
        }}
        hoverContent={
          <FgHoverContentStandard
            content={audioActive ? "Remove audio" : "Enable audio"}
          />
        }
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Enable audio"}
      />
      {audioActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgButton
            externalRef={muteBtnRef}
            clickFunction={() => {
              setVolumeState((prev) => ({
                from: prev.to,
                to: mutedAudioRef.current ? "high" : "off",
              }));
              handleExternalMute();
            }}
            className="relative flex aspect-square h-full items-center justify-center rounded-full hover:border-2 hover:border-fg-off-white disabled:opacity-25"
            contentFunction={() => (
              <svg
                className="aspect-square h-[75%]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100.0001 100.00001"
                fill="white"
              >
                <VolumeSVG
                  volumeState={volumeState}
                  movingPath={volumeSVGPaths.low.right}
                  stationaryPaths={[
                    volumeSVGPaths.high.left,
                    volumeSVGPaths.high.middle,
                  ]}
                  color="white"
                />
                {volumeState.from === "" && volumeState.to === "off" && (
                  <path d={volumeSVGPaths.strike} />
                )}
              </svg>
            )}
            hoverContent={
              <FgHoverContentStandard
                content={mutedAudioRef.current ? "Unmute" : "Mute"}
              />
            }
            options={{ hoverTimeoutDuration: 100 }}
            aria-label={"Mute"}
          />
        </Suspense>
      )}
    </div>
  );
}
