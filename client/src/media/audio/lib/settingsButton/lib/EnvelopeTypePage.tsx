import React, { useRef } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  EnvelopeTypes,
  envelopeTypesTitles,
} from "../../typeConstant";
import MixGaussianEnvelopeSection from "./MixGaussianEnvelopeSection";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function EnvelopeTypePage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setEnvelopeType = (envelopeType: EnvelopeTypes) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.envelopeType.value = envelopeType;

      if (
        envelopeType === "mixGaussian" &&
        newSettings.envelopeType.mixGausianEnvelope.value.length === 0
      ) {
        newSettings.envelopeType.mixGausianEnvelope.value.push({
          amplitude: 0.8,
          mean: 0.2,
          stdDev: 0.05,
        });
      }

      return newSettings;
    });
  };

  const handleCloseEnvelopeTypePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.envelopeType.active = !newActivePages.envelopeType.active;

      return newActivePages;
    });
  };

  const handleOpenEnvelopeOptionsPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      if (settings.envelopeType.value !== "mixGaussian") {
        newActivePages.envelopeType[
          `${settings.envelopeType.value}Options`
        ].active =
          !newActivePages.envelopeType[`${settings.envelopeType.value}Options`]
            .active;
      }

      return newActivePages;
    });
  };

  return (
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2'>
      <div
        className={`${
          settings.envelopeType.value !== "mixGaussian"
            ? "justify-between"
            : "justify-start"
        } flex h-6 w-full items-center space-x-1`}
      >
        <div className='flex h-full w-max justify-center items-center space-x-1'>
          <FgButton
            className='h-full aspect-square'
            contentFunction={() => (
              <FgSVG
                src={navigateBackIcon}
                attributes={[
                  { key: "width", value: "95%" },
                  { key: "height", value: "95%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
            clickFunction={handleCloseEnvelopeTypePage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseEnvelopeTypePage}
          >
            Envelope
          </div>
        </div>
        {settings.envelopeType.value !== "mixGaussian" && (
          <FgButton
            contentFunction={() => (
              <div className='px-2 bg-opacity-75 hover:bg-fg-white hover:text-fg-tone-black-1 rounded font-Josefin text-lg font-bold pt-0.5'>
                Options
              </div>
            )}
            clickFunction={handleOpenEnvelopeOptionsPage}
          />
        )}
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='w-full overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        <div className='flex w-full flex-col space-y-1 h-max'>
          {Object.entries(envelopeTypesTitles).map(([key, title]) => (
            <FgButton
              key={key}
              className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                key === settings.envelopeType.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
              contentFunction={() => (
                <div className='flex w-full bg-opacity-75 px-2 items-start'>
                  {title}
                </div>
              )}
              clickFunction={() => setEnvelopeType(key as EnvelopeTypes)}
            />
          ))}
          {settings.envelopeType.value === "mixGaussian" && (
            <MixGaussianEnvelopeSection
              settings={settings}
              setSettings={setSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}
