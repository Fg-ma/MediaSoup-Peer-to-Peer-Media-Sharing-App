import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import { Settings, ActivePages } from "../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export const samplesSelections = ["1", "4", "8", "16", "32"];

export default function SamplesPage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setSamples = (samples: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.downloadImageOptions.samples.value = samples;

      return newSettings;
    });
  };

  const handleCloseSamplesPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadImageOptions.samples.active =
        !newActivePages.downloadImageOptions.samples.active;

      return newActivePages;
    });
  };

  return (
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2'>
      <div className='flex h-6 w-full justify-between'>
        <div className='flex w-full space-x-1'>
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
            clickFunction={handleCloseSamplesPage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseSamplesPage}
          >
            Samples
          </div>
        </div>
        <div></div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        <FgSlider
          className='h-10'
          externalValue={settings.downloadImageOptions.samples.value}
          externalStyleValue={settings.downloadImageOptions.samples.value}
          onValueChange={(value) => {
            setSamples(value.value);
          }}
          options={{
            initValue: settings.downloadImageOptions.samples.value,
            ticks: 6,
            rangeMax: 64,
            rangeMin: 1,
            snapToWholeNum: true,
            orientation: "horizontal",
            tickLabels: false,
          }}
        />
        {Object.entries(samplesSelections)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([key, samples]) => (
            <div
              key={key}
              className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseInt(samples) ===
                settings.downloadImageOptions.samples.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className='flex items-center justify-center grow'
                contentFunction={() => (
                  <div className='flex w-full bg-opacity-75 px-2 items-start'>
                    {samples}
                  </div>
                )}
                clickFunction={() => {
                  setSamples(parseInt(samples));
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
