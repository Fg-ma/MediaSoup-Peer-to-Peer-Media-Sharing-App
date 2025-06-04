import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useGeneralContext } from "../../../../../context/generalContext/GeneralContext";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import FgButton from "../../../../../elements/fgButton/FgButton";
import HoverElement from "../../../../../elements/hoverElement/HoverElement";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
import { IncomingMediasoupMessages } from "../../../../../serverControllers/mediasoupServer/lib/typeConstant";
import FgInput from "../../../../../elements/fgInput/FgInput";
import {
  colorSettingsTitles,
  ColorSettingsTypes,
  envelopeTypesTitles,
  MuteStyleTypes,
} from "../../../../../media/audio/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";
const captionsIcon = nginxAssetServerBaseUrl + "svgs/captionsIcon.svg";

export default function AudioMediaSettingsPanel({
  instanceId,
  isUser,
  username,
  instance,
  setExternalRerender,
}: {
  instanceId: string;
  isUser: boolean;
  username: string;
  instance: string;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia, remoteMedia } = useMediaContext();
  const { mediasoupSocket } = useSocketContext();
  const { currentSettingsActive } = useGeneralContext();
  const { sendSettingsSignal } = useSignalContext();

  const audioMedia = useRef(
    isUser
      ? userMedia.current.audio
      : remoteMedia.current[username][instance].audio,
  );

  const [closedCaptionsActive, setClosedCaptionsActive] = useState(false);
  const [_, setRerender] = useState(false);
  const filenameRef = useRef<HTMLDivElement>(null);
  const subtitlesLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioMedia.current = isUser
      ? userMedia.current.audio
      : remoteMedia.current[username][instance].audio;

    setClosedCaptionsActive(false);

    setRerender((prev) => !prev);
  }, [instanceId]);

  const handleMediasoupMessages = (msg: IncomingMediasoupMessages) => {
    switch (msg.type) {
      case "producerDisconnected":
        if (msg.header.producerType === "audio") {
          setRerender((prev) => !prev);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    mediasoupSocket.current?.addMessageListener(handleMediasoupMessages);

    return () => {
      mediasoupSocket.current?.removeMessageListener(handleMediasoupMessages);
    };
  }, []);

  return (
    <div
      className="mx-6 my-4 flex h-max max-w-[320px] flex-col items-center justify-center space-y-1 rounded border border-fg-white bg-fg-tone-black-8 px-2 py-2 font-K2D text-fg-white"
      style={{ width: "calc(100% - 3rem)" }}
    >
      <div className="flex h-7 w-full items-center justify-start px-1">
        <FgButton
          className="mr-2 flex h-full items-center justify-center"
          contentFunction={() => (
            <FgSVGElement
              src={closeIcon}
              className="aspect-square h-[55%] fill-fg-white stroke-fg-white"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          )}
          clickFunction={() => {
            const idx = currentSettingsActive.current.findIndex(
              (active) =>
                "image" === active.contentType &&
                instanceId === active.instanceId,
            );

            if (idx !== -1) {
              currentSettingsActive.current.splice(idx, 1);
              sendSettingsSignal({
                type: "sidePanelChanged",
              });
              setExternalRerender((prev) => !prev);
            }
          }}
          hoverContent={
            <FgHoverContentStandard content={"Close settings"} style="light" />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        <HoverElement
          externalRef={filenameRef}
          className="truncate py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4"
          style={{ width: "calc(100% - 2.25rem)" }}
          content={<>{`${username}'s audio`}</>}
          hoverContent={
            (filenameRef.current?.scrollWidth ?? 0) >
            (filenameRef.current?.clientWidth ?? 0) ? (
              <FgHoverContentStandard style="light" content="Audio settings" />
            ) : undefined
          }
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 750,
          }}
        />
      </div>
      <div className="flex w-full items-center justify-between text-nowrap rounded px-2">
        <div className="pr-8">Frequency</div>
        <FgInput
          className="h-6 rounded-sm"
          onChange={handleChangeFrequency}
          externalValue={externalNumFixedPointsValue}
          options={{ submitButton: false }}
        />
      </div>
      <FgButton
        className="w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
            <div>Envelope</div>
            <div>
              {
                envelopeTypesTitles[
                  audioMedia.current.settings.envelopeType.value
                ]
              }
            </div>
          </div>
        )}
        clickFunction={handleEnvelopeTypeActive}
      />
      <FgButton
        className="w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
            <div className="mr-3">Mute style</div>
            <div className="h-full grow truncate text-right">
              {muteStyleTypes.includes(
                audioMedia.current.settings.muteStyle.value as MuteStyleTypes,
              )
                ? muteStylesMeta[
                    audioMedia.current.settings.muteStyle
                      .value as MuteStyleTypes
                  ].title
                : (() => {
                    const entry = Object.entries(
                      staticContentMedia.current.svg.user,
                    ).find(
                      ([svgId]) =>
                        svgId === audioMedia.current.settings.muteStyle.value,
                    );
                    return entry
                      ? entry[1].filename.slice(
                          0,
                          entry[1].filename.lastIndexOf("."),
                        )
                      : "";
                  })()}
            </div>
          </div>
        )}
        clickFunction={handleMuteStyleActive}
      />
      {Object.entries(colorSettingsTitles).map(([key, title]) => (
        <div
          key={key}
          className="flex w-full items-center justify-between text-nowrap rounded px-2"
        >
          <div>{title}</div>
          <ColorPickerButton
            externalColorPickerPanelRef={
              colorPickerRefs[key as ColorSettingsTypes]
            }
            className="aspect-square h-6"
            defaultColor={
              audioMedia.current.settings[key as ColorSettingsTypes].value
            }
            handleAcceptColorCallback={(color) =>
              handleAcceptColor(key as ColorSettingsTypes, color)
            }
          />
        </div>
      ))}
    </div>
  );
}
