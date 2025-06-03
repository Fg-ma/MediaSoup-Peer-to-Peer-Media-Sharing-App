import React, { useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import RemoteVisualMedia from "../../../../../../media/fgVisualMedia/RemoteVisualMedia";
import ScreenMedia from "../../../../../../media/fgVisualMedia/ScreenMedia";
import CameraMedia from "../../../../../../media/fgVisualMedia/CameraMedia";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import ClosedCaptionsOptionsPage from "./ClosedCaptionsOptionsPage";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export const closedCaptionsSelections = {
  ar: "Arabic",
  "ar-TN": "Arabic (Tunisian)",
  br: "Brenton",
  "ca-ES": "Catalan",
  "zh-CN": "Chinese (China)",
  cs: "Czech",
  "de-DE": "German",
  "en-IN": "English (India)",
  "en-US": "English (US)",
  eo: "Esperanto",
  "es-ES": "Spanish (Spain)",
  fa: "Farsi",
  "fr-FR": "French",
  gu: "Gujarati",
  hi: "Hindi",
  "it-IT": "Italian",
  ja: "Japanese",
  ko: "Korean",
  kz: "Kazakh",
  nl: "Dutch",
  pl: "Polish",
  "pt-PT": "Portuguese",
  "ru-RU": "Russian",
  sv: "Swedish",
  tg: "Tajik",
  "tr-TR": "Turkish",
  uk: "Ukrainian",
  uz: "Uzbek",
  "vi-VN": "Vietnamese",
};

export default function ClosedCaptionsPage({
  visualMedia,
  setRerender,
}: {
  visualMedia: React.MutableRefObject<
    CameraMedia | ScreenMedia | RemoteVisualMedia | undefined
  >;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [closedCaptionsOptionActive, setClosedCaptionsOptionsActive] =
    useState(false);
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setClosedCaptionsLang = (
    newLang: keyof typeof closedCaptionsSelections,
  ) => {
    if (visualMedia.current)
      visualMedia.current.settings.closedCaption.value = newLang;

    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 1rem)" }}
      ></div>
      <div
        ref={scrollingContainerRef}
        className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] flex-col space-y-1 overflow-y-auto px-2"
        style={{ width: "calc(100% - 1rem)" }}
      >
        {Object.entries(closedCaptionsSelections).map(([key, lang]) => (
          <div
            key={key}
            className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
              key === visualMedia.current?.settings.closedCaption.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
          >
            <FgButton
              className="flex grow items-center justify-center"
              style={{ width: "calc(100% - 3rem)" }}
              contentFunction={() => (
                <div className="w-full truncate px-2 text-start">{lang}</div>
              )}
              clickFunction={() =>
                setClosedCaptionsLang(
                  key as keyof typeof closedCaptionsSelections,
                )
              }
            />
            <FgButton
              className="flex w-max items-center justify-center"
              contentFunction={() => <div className="w-full px-2">(AG)</div>}
              clickFunction={() =>
                setClosedCaptionsLang(
                  key as keyof typeof closedCaptionsSelections,
                )
              }
              hoverContent={<FgHoverContentStandard content="Auto generated" />}
              scrollingContainerRef={scrollingContainerRef}
              options={{
                hoverTimeoutDuration: 2000,
              }}
            />
          </div>
        ))}
      </div>
      <FgButton
        className="h-7"
        style={{ width: "calc(100% - 1rem)" }}
        contentFunction={() => (
          <div className="flex w-full items-center justify-between text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div>Options</div>
            <FgSVGElement
              src={navigateForwardIcon}
              className={`${closedCaptionsOptionActive ? "-scale-x-100" : ""} rotate-90`}
              attributes={[
                { key: "width", value: "1.25rem" },
                { key: "height", value: "1.25rem" },
              ]}
            />
          </div>
        )}
        clickFunction={() => setClosedCaptionsOptionsActive((prev) => !prev)}
      />
      {closedCaptionsOptionActive && (
        <ClosedCaptionsOptionsPage
          visualMedia={visualMedia}
          setRerender={setRerender}
        />
      )}
    </>
  );
}
