import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import { useStreamsContext } from "../../../context/streamsContext/StreamsContext";
import CameraSectionController from "./lib/cameraSectionController";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import shareCameraIcon from "../../../../public/svgs/shareCameraIcon.svg";
import removeCameraIcon from "../../../../public/svgs/removeCameraIcon.svg";
import ProducersController from "../../../lib/ProducersController";

export default function CameraSection({
  socket,
  device,
  table_id,
  username,
  instance,
  cameraBtnRef,
  newCameraBtnRef,
  isCamera,
  isScreen,
  isAudio,
  setCameraActive,
  cameraActive,
  producersController,
  handleDisableEnableBtns,
}: {
  socket: React.MutableRefObject<Socket>;
  device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  cameraBtnRef: React.RefObject<HTMLButtonElement>;
  newCameraBtnRef: React.RefObject<HTMLButtonElement>;
  isCamera: React.MutableRefObject<boolean>;
  isScreen: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  cameraActive: boolean;
  producersController: ProducersController;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { userMedia, userCameraCount } = useStreamsContext();

  const cameraSectionController = new CameraSectionController(
    socket,
    device,
    table_id,
    username,
    instance,

    isCamera,
    isScreen,
    isAudio,
    setCameraActive,

    userMedia,
    userCameraCount,

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
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            {cameraActive ? "Remove Camera" : "Publish Camera"}
          </div>
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
        hoverContent={
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Publish a new camera
          </div>
        }
      />
    </div>
  );
}
