import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { Settings, ActivePages } from "../../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

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
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setClosedCaptionsLang = (
    newLang: keyof typeof closedCaptionsSelections,
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.closedCaption.value = newLang;

      return newSettings;
    });
  };

  const handleCloseClosedCaptionPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.active =
        !newActivePages.closedCaption.active;

      return newActivePages;
    });
  };

  const handleClosedCaptionOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.closedCaptionOptionsActive.active =
        !newActivePages.closedCaption.closedCaptionOptionsActive.active;

      return newActivePages;
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div className="flex h-6 w-full justify-between">
        <div className="flex w-full space-x-1">
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
            clickFunction={handleCloseClosedCaptionPage}
          />
          <div
            className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
            onClick={handleCloseClosedCaptionPage}
          >
            Subtitles
          </div>
        </div>
        <FgButton
          contentFunction={() => (
            <div className="rounded bg-opacity-75 px-2 pt-0.5 font-Josefin text-lg font-bold hover:bg-fg-white hover:text-fg-tone-black-1">
              Options
            </div>
          )}
          clickFunction={handleClosedCaptionOptionsActive}
        />
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-white bg-opacity-75"></div>
      <div
        ref={scrollingContainerRef}
        className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2"
      >
        {Object.entries(closedCaptionsSelections).map(([key, lang]) => (
          <div
            key={key}
            className={`flex w-full items-center justify-center text-nowrap rounded bg-opacity-75 hover:bg-fg-white hover:text-fg-tone-black-1 ${
              key === settings.closedCaption.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
          >
            <FgButton
              className="flex grow items-center justify-center"
              contentFunction={() => (
                <div className="flex w-full items-start bg-opacity-75 px-2">
                  {lang}
                </div>
              )}
              clickFunction={() =>
                setClosedCaptionsLang(
                  key as keyof typeof closedCaptionsSelections,
                )
              }
            />
            <FgButton
              className="flex w-max items-center justify-center"
              contentFunction={() => (
                <div className="w-full bg-opacity-75 px-2">(AG)</div>
              )}
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
    </div>
  );
}
