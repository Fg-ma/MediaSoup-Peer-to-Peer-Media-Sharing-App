import React from "react";
import { types } from "mediasoup-client";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import ProducersController from "../../../lib/ProducersController";
import CameraSectionController from "./lib/cameraSectionController";

import shareCameraIcon from "../../../../public/svgs/shareCameraIcon.svg";
import removeCameraIcon from "../../../../public/svgs/removeCameraIcon.svg";

export default function CameraSection({
  device,
  table_id,
  username,
  instance,
  cameraBtnRef,
  newCameraBtnRef,
  isCamera,
  setCameraActive,
  cameraActive,
  producersController,
  handleDisableEnableBtns,
}: {
  device: React.MutableRefObject<types.Device | undefined>;
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
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
    <div className='flex space-x-4 mx-2 h-10'>
      <FgButton
        externalRef={cameraBtnRef}
        clickFunction={() => cameraSectionController.shareCamera()}
        className={`${
          cameraActive
            ? "bg-orange-500 hover:bg-orange-700"
            : "bg-blue-500 hover:bg-blue-700"
        } text-white font-bold p-1 disabled:opacity-25`}
        contentFunction={() => {
          if (cameraActive) {
            return (
              <FgSVG
                src={removeCameraIcon}
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
                src={shareCameraIcon}
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
            content={cameraActive ? "Remove camera" : "Publish camera"}
          />
        }
      />
      <FgButton
        externalRef={newCameraBtnRef}
        clickFunction={() => cameraSectionController.shareNewCamera()}
        className={`${
          cameraActive ? "visible" : "hidden"
        } bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 disabled:opacity-25`}
        contentFunction={() => (
          <FgSVG
            src={shareCameraIcon}
            className='h-full aspect-square'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content='Publish a new camera' />}
      />
    </div>
  );
}
