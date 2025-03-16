import React from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import ProducersController from "../../../lib/ProducersController";
import CameraSectionController from "./lib/cameraSectionController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const shareCameraIcon = nginxAssetServerBaseUrl + "svgs/shareCameraIcon.svg";
const removeCameraIcon = nginxAssetServerBaseUrl + "svgs/removeCameraIcon.svg";

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
    <div className='flex h-full space-x-4'>
      <FgButton
        externalRef={cameraBtnRef}
        clickFunction={() => cameraSectionController.shareCamera()}
        className='flex disabled:opacity-25 h-full aspect-square rounded-full items-center justify-center relative hover:border-2 hover:border-fg-off-white'
        contentFunction={() => {
          if (cameraActive) {
            return (
              <FgSVGElement
                src={removeCameraIcon}
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
              <FgSVGElement
                src={shareCameraIcon}
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
          <FgSVGElement
            src={shareCameraIcon}
            className='h-[80%] aspect-square'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
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
