import React, { useRef } from "react";
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
  producersController: React.MutableRefObject<ProducersController>;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { userMedia } = useMediaContext();
  const { mediasoupSocket } = useSocketContext();
  const { tableId, username, instance, device } = useUserInfoContext();

  const cameraSectionController = useRef(
    new CameraSectionController(
      mediasoupSocket,
      device,
      tableId,
      username,
      instance,
      isCamera,
      setCameraActive,
      userMedia,
      producersController,
      handleDisableEnableBtns,
    ),
  );

  return (
    <div className="flex h-full space-x-4">
      <FgButton
        externalRef={cameraBtnRef}
        clickFunction={cameraSectionController.current.shareCamera}
        className="relative flex aspect-square h-full items-center justify-center rounded-full hover:border-2 hover:border-fg-off-white disabled:opacity-25"
        contentFunction={() => {
          if (cameraActive) {
            return (
              <FgSVGElement
                src={removeCameraIcon}
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
                src={shareCameraIcon}
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
            content={cameraActive ? "Remove camera" : "Enable camera"}
          />
        }
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Enable camera"}
      />
      <FgButton
        externalRef={newCameraBtnRef}
        clickFunction={cameraSectionController.current.shareNewCamera}
        className={`${
          cameraActive ? "" : "hidden"
        } relative flex aspect-square h-full items-center justify-center rounded-full hover:border-2 hover:border-fg-off-white disabled:opacity-25`}
        contentFunction={() => (
          <FgSVGElement
            src={shareCameraIcon}
            className="aspect-square h-[80%]"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content="Add new camera" />}
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Add new camera"}
      />
    </div>
  );
}
