import React, { Suspense, useEffect, useState } from "react";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import ProducersController from "../../../lib/ProducersController";
import AudioSectionController from "./lib/audioSectionController";
import volumeSVGPaths from "../../../fgVolumeElement/lib/volumeSVGPaths";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const shareAudioIcon = nginxAssetSeverBaseUrl + "svgs/shareAudioIcon.svg";
const removeAudioIcon = nginxAssetSeverBaseUrl + "svgs/removeAudioIcon.svg";

const FgButton = React.lazy(
  () => import("../../../elements/fgButton/FgButton")
);
const VolumeSVG = React.lazy(
  () => import("../../../fgVolumeElement/lib/VolumeSVG")
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
  producersController: ProducersController;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { mediasoupSocket } = useSocketContext();
  const { table_id, username, instance } = useUserInfoContext();

  const [volumeState, setVolumeState] = useState<{
    from: "off" | "low" | "high" | "";
    to: "off" | "low" | "high";
  }>({
    from: "",
    to: mutedAudioRef.current ? "off" : "high",
  });

  const audioSectionController = new AudioSectionController(
    mediasoupSocket,
    table_id,
    username,
    instance,

    producersController,

    isAudio,
    setAudioActive,

    handleDisableEnableBtns
  );

  useEffect(() => {
    const newTo = mutedAudioRef.current ? "off" : "high";

    if (newTo !== volumeState.to) {
      setVolumeState((prev) => ({ from: prev.to, to: newTo }));
    }
  }, [mutedAudioRef.current]);

  return (
    <div className='flex space-x-4 h-full'>
      <FgButton
        externalRef={audioBtnRef}
        clickFunction={() => audioSectionController.shareAudio()}
        className='flex disabled:opacity-25 h-full aspect-square rounded-full items-center justify-center relative hover:border-2 hover:border-fg-off-white'
        contentFunction={() => {
          if (audioActive) {
            return (
              <FgSVG
                src={removeAudioIcon}
                className='h-[80%] aspect-square'
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                ]}
              />
            );
          } else {
            return (
              <FgSVG
                src={shareAudioIcon}
                className='h-[80%] aspect-square'
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
            className='flex disabled:opacity-25 h-full aspect-square rounded-full items-center justify-center relative hover:border-2 hover:border-fg-off-white'
            contentFunction={() => (
              <svg
                className='h-[75%] aspect-square'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 100.0001 100.00001'
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
