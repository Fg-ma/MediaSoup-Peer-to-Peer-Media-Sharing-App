import React from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import ProducersController from "../../../lib/ProducersController";
import CameraSectionController from "./lib/cameraSectionController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const shareCameraIcon = nginxAssetSeverBaseUrl + "svgs/shareCameraIcon.svg";
const removeCameraIcon = nginxAssetSeverBaseUrl + "svgs/removeCameraIcon.svg";

export default function CameraSection({
  cameraBtnRef,
  newCameraBtnRef,
  isCamera,
  setCameraActive,
  cameraActive,
  producersController,
  handleDisableEnableBtns,
}: {
  cameraBtnRef: React.RefObject<HTMLButtonElement>;
  newCameraBtnRef: React.RefObject<HTMLButtonElement>;
  isCamera: React.MutableRefObject<boolean>;
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  cameraActive: boolean;
  producersController: ProducersController;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { userMedia } = useMediaContext();
  const { mediasoupSocket } = useSocketContext();
  const { table_id, username, instance, device } = useUserInfoContext();

  const cameraSectionController = new CameraSectionController(
    mediasoupSocket,
    device,
    table_id,
    username,
    instance,

    isCamera,
    setCameraActive,

    userMedia,

    producersController,

    handleDisableEnableBtns
  );

  return (
    <div className='h-full flex space-x-4'>
      <FgButton
        externalRef={cameraBtnRef}
        clickFunction={() => cameraSectionController.shareCamera()}
        className='disabled:opacity-25 h-full aspect-square rounded-full flex items-center justify-center relative hover:border-2 hover:border-fg-off-white'
        contentFunction={() => {
          if (cameraActive) {
            return (
              <FgSVG
                src={removeCameraIcon}
                className='h-[80%] aspect-square'
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
                src={shareCameraIcon}
                className='h-[80%] aspect-square'
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
            content={cameraActive ? "Remove camera" : "Enable camera"}
          />
        }
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Enable camera"}
      />
      <FgButton
        externalRef={newCameraBtnRef}
        clickFunction={() => cameraSectionController.shareNewCamera()}
        className={`${
          cameraActive ? "" : "hidden"
        } disabled:opacity-25 h-full aspect-square rounded-full flex items-center justify-center relative hover:border-2 hover:border-fg-off-white`}
        contentFunction={() => (
          <FgSVG
            src={shareCameraIcon}
            className='h-[80%] aspect-square'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content='Add new camera' />}
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Add new camera"}
      />
    </div>
  );
}
