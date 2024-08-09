import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import AudioSectionController from "./lib/audioSectionController";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import shareAudioIcon from "../../public/svgs/shareAudioIcon.svg";
import removeAudioIcon from "../../public/svgs/removeAudioIcon.svg";

export default function AudioSection({
  socket,
  device,
  table_id,
  username,
  audioBtnRef,
  muteBtnRef,
  mutedAudioRef,
  isAudio,
  audioActive,
  setAudioActive,
  handleMuteExternalMute,
  handleDisableEnableBtns,
}: {
  socket: React.MutableRefObject<Socket>;
  device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  audioBtnRef: React.RefObject<HTMLButtonElement>;
  muteBtnRef: React.RefObject<HTMLButtonElement>;
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  audioActive: boolean;
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleMuteExternalMute: () => void;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const audioSectionController = new AudioSectionController(
    socket,
    device,
    table_id,
    username,

    isAudio,
    setAudioActive,

    handleDisableEnableBtns
  );

  return (
    <div className='flex space-x-4 mx-2 h-10'>
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
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            {audioActive ? "Remove Audio" : "Publish Audio"}
          </div>
        }
      />
      {audioActive && (
        <FgButton
          externalRef={muteBtnRef}
          clickFunction={handleMuteExternalMute}
          className={`${
            mutedAudioRef.current
              ? "bg-orange-500 hover:bg-orange-700"
              : "bg-blue-500 hover:bg-blue-700"
          } text-white font-bold py-2 px-3 disabled:opacity-25`}
          contentFunction={() => (
            <>{mutedAudioRef.current ? "Unmute" : "Mute"}</>
          )}
          hoverContent={
            <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              {mutedAudioRef.current ? "Unmute" : "Mute"}
            </div>
          }
        />
      )}
    </div>
  );
}
