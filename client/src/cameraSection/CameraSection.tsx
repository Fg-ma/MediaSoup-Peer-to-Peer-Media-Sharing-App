import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../context/StreamsContext";
import CameraSectionController from "./lib/cameraSectionController";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import shareCameraIcon from "../../public/svgs/shareCameraIcon.svg";
import removeCameraIcon from "../../public/svgs/removeCameraIcon.svg";
import Producers from "src/lib/Producers";
import BrowserMedia from "src/BrowserMedia";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import UserDevice from "src/UserDevice";
import Deadbanding from "src/effects/visualEffects/lib/Deadbanding";

export default function CameraSection({
  socket,
  device,
  table_id,
  username,
  instance,
  cameraBtnRef,
  newCameraBtnRef,
  isCamera,
  setCameraActive,
  cameraActive,
  producers,
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
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  cameraActive: boolean;
  producers: Producers;
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
    setCameraActive,

    userMedia,
    userCameraCount,

    producers,

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
