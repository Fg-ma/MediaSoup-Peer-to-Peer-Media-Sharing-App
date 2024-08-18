import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import { useStreamsContext } from "../context/StreamsContext";
import ScreenSectionController from "./lib/screenSectionController";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import removeScreenIcon from "../../public/svgs/removeScreenIcon.svg";
import shareScreenIcon from "../../public/svgs/shareScreenIcon.svg";
import Producers from "src/lib/Producers";

export default function ScreenSection({
  socket,
  device,
  table_id,
  username,
  instance,
  screenBtnRef,
  newScreenBtnRef,
  isScreen,
  screenActive,
  setScreenActive,
  producers,
  handleDisableEnableBtns,
}: {
  socket: React.MutableRefObject<Socket>;
  device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  screenBtnRef: React.RefObject<HTMLButtonElement>;
  newScreenBtnRef: React.RefObject<HTMLButtonElement>;
  isScreen: React.MutableRefObject<boolean>;
  screenActive: boolean;
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
  producers: Producers;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { userMedia, userScreenCount } = useStreamsContext();

  const screenSectionController = new ScreenSectionController(
    socket,
    device,
    table_id,
    username,
    instance,

    isScreen,
    setScreenActive,

    userMedia,
    userScreenCount,

    producers,

    handleDisableEnableBtns
  );

  return (
    <div className='flex space-x-4 mx-2 h-10'>
      <FgButton
        externalRef={screenBtnRef}
        clickFunction={() => screenSectionController.shareScreen()}
        className={`${
          screenActive
            ? "bg-orange-500 hover:bg-orange-700"
            : "bg-blue-500 hover:bg-blue-700"
        } text-white font-bold p-1 disabled:opacity-25`}
        contentFunction={() => {
          if (screenActive) {
            return (
              <FgSVG
                src={removeScreenIcon}
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
                src={shareScreenIcon}
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
            {screenActive ? "Remove screen" : "Share screen"}
          </div>
        }
      />
      {screenActive && (
        <FgButton
          externalRef={newScreenBtnRef}
          clickFunction={() => screenSectionController.shareNewScreen()}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 disabled:opacity-25'
          contentFunction={() => (
            <FgSVG
              src={shareScreenIcon}
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
              Share a new screen
            </div>
          }
        />
      )}
    </div>
  );
}
