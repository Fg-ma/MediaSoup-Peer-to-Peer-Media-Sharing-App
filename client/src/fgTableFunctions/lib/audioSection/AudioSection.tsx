import React, { Suspense, useEffect, useState } from "react";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import ProducersController from "../../../lib/ProducersController";
import AudioSectionController from "./lib/audioSectionController";
import volumeSVGPaths from "../../../fgVolumeElement/lib/volumeSVGPaths";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const shareAudioIcon = nginxAssetSeverBaseUrl + "svgs/shareAudioIcon.svg";
const removeAudioIcon = nginxAssetSeverBaseUrl + "svgs/removeAudioIcon.svg";

const FgButton = React.lazy(
  () => import("../../../fgElements/fgButton/FgButton")
);
const VolumeSVG = React.lazy(
  () => import("../../../fgVolumeElement/lib/VolumeSVG")
);

export default function AudioSection({
  table_id,
  username,
  instance,
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
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
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
    <div className='flex space-x-4 mx-2 h-10 pointer-events-auto'>
      <FgButton
        externalRef={audioBtnRef}
        clickFunction={() => audioSectionController.shareAudio()}
        className={`${
          audioActive
            ? "bg-orange-500 hover:bg-orange-700"
            : "bg-blue-500 hover:bg-blue-700"
        } text-white font-bold p-1 disabled:opacity-25`}
        contentFunction={() => {
          if (audioActive) {
            return (
              <FgSVG
                src={removeAudioIcon}
                className='h-full aspect-square'
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "white" },
                ]}
              />
            );
          } else {
            return (
              <FgSVG
                src={shareAudioIcon}
                className='h-full aspect-square'
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "white" },
                ]}
              />
            );
          }
        }}
        hoverContent={
          <FgHoverContentStandard
            content={audioActive ? "Remove audio" : "Publish audio"}
          />
        }
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
            className={`${
              mutedAudioRef.current
                ? "bg-orange-500 hover:bg-orange-700"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold p-1 disabled:opacity-25`}
            contentFunction={() => (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 100.0001 100.00001'
                width='100%'
                height='100%'
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
          />
        </Suspense>
      )}
    </div>
  );
}
