import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  MuteStyleTypes,
  muteStylesMeta,
} from "../../typeConstant";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
import { IncomingUserStaticContentMessages } from "../../../../../serverControllers/userStaticContentServer/lib/typeConstant";
import { SvgListenerTypes } from "../../../../../media/fgUserSvg/UserSvgMedia";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function MuteStylePage({
  setSettingsActive,
  setActivePages,
  settings,
  setSettings,
  setIsBezierCurveEditor,
}: {
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setIsBezierCurveEditor: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { userStaticContentSocket } = useSocketContext();

  const [_, setRerender] = useState(false);
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setMuteStyle = (muteStyle: MuteStyleTypes | string) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.muteStyle.value = muteStyle;

      return newSettings;
    });
  };

  const handleCloseMuteStylePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.muteStyle.active = !newActivePages.muteStyle.active;

      return newActivePages;
    });
  };

  const handleUserStaticContentMessage = (
    message: IncomingUserStaticContentMessages,
  ) => {
    if (message.type !== "muteStylesResponse") return;

    setRerender((prev) => !prev);

    for (const svgMedia of Object.values(staticContentMedia.current.svg.user)) {
      if (!svgMedia.state.includes("muteStyle")) return;

      const listener = (message: SvgListenerTypes) => {
        if ((message.type = "downloadComplete")) {
          setRerender((prev) => !prev);

          svgMedia.removeSvgListener(listener);
        }
      };

      svgMedia.addSvgListener(listener);
    }
  };

  useEffect(() => {
    userStaticContentSocket.current?.addMessageListener(
      handleUserStaticContentMessage,
    );

    return () => {
      userStaticContentSocket.current?.removeMessageListener(
        handleUserStaticContentMessage,
      );
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div className="flex h-6 w-full justify-start space-x-1">
        <FgButton
          className="aspect-square h-full"
          contentFunction={() => (
            <FgSVGElement
              src={navigateBackIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          )}
          clickFunction={handleCloseMuteStylePage}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleCloseMuteStylePage}
        >
          Mute style
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div
        ref={scrollingContainerRef}
        className="small-vertical-scroll-bar h-max max-h-[11.375rem] w-full overflow-y-auto px-2"
      >
        <div className="flex h-max w-full flex-col space-y-1">
          <FgButton
            className="flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-tone-black-6"
            contentFunction={() => (
              <div className="flex w-full items-center justify-start px-2 text-lg">
                Make your own
              </div>
            )}
            clickFunction={() => {
              setIsBezierCurveEditor((prev) => !prev);
              setSettingsActive((prev) => !prev);
            }}
          />
          {Object.entries(staticContentMedia.current.svg.user).map(
            ([svgId, svgMedia]) =>
              svgMedia.state.includes("muteStyle") && (
                <FgButton
                  key={svgId}
                  className={`flex w-full items-center justify-center text-nowrap rounded ${
                    svgId === settings.muteStyle.value
                      ? "bg-fg-tone-black-8"
                      : "hover:bg-fg-tone-black-7"
                  }`}
                  contentFunction={() => (
                    <div
                      className={`${
                        svgMedia.filename ? "justify-between" : "justify-start"
                      } flex w-full items-center px-2 text-lg`}
                    >
                      <div className="h-full grow truncate text-left">
                        {svgMedia.filename.slice(
                          0,
                          svgMedia.filename.lastIndexOf("."),
                        )}
                      </div>
                      {svgMedia.blobURL && (
                        <FgSVGElement
                          src={svgMedia.blobURL}
                          className="ml-2 aspect-square h-6"
                          attributes={[
                            { key: "height", value: "100%" },
                            { key: "width", value: "100%" },
                          ]}
                        />
                      )}
                    </div>
                  )}
                  clickFunction={() => {
                    setMuteStyle(svgId);
                  }}
                />
              ),
          )}
          {Object.entries(muteStylesMeta).map(([key, meta]) => (
            <FgButton
              key={key}
              className={`mute-style-container flex w-full items-center justify-center text-nowrap rounded ${
                key === settings.muteStyle.value
                  ? "bg-fg-tone-black-8"
                  : "hover:bg-fg-tone-black-7"
              }`}
              contentFunction={() => (
                <div
                  className={`${
                    meta.url ? "justify-between" : "justify-start"
                  } flex w-full items-center px-2 text-lg`}
                >
                  <>{meta.title}</>
                  {meta.url && (
                    <FgSVGElement
                      src={meta.url}
                      className="mute-style-icon aspect-square h-6 stroke-fg-white"
                      attributes={[
                        { key: "height", value: "100%" },
                        { key: "width", value: "100%" },
                      ]}
                    />
                  )}
                </div>
              )}
              clickFunction={() => setMuteStyle(key as MuteStyleTypes)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
