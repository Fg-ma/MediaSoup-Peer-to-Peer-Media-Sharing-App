import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import { Settings, ActivePages } from "../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";
import CaptureMediaController from "../../CaptureMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export const videoSpeedSelections = [
  "0.25",
  "0.5",
  "0.75",
  "1",
  "2",
  "2.5",
  "3",
];

export default function VideoSpeedPage({
  captureMediaController,
  setActivePages,
  settings,
  setSettings,
}: {
  captureMediaController: CaptureMediaController;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setVideoSpeed = (videoSpeed: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.videoSpeed.value = videoSpeed;

      return newSettings;
    });

    captureMediaController.handlePlaybackSpeed(videoSpeed);
  };

  const handleCloseVideoSpeedPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.videoSpeed.active = !newActivePages.videoSpeed.active;

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
            clickFunction={handleCloseVideoSpeedPage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseVideoSpeedPage}
          >
            Video speed
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
          externalValue={settings.videoSpeed.value}
          externalStyleValue={settings.videoSpeed.value}
          onValueChange={(value) => {
            setVideoSpeed(value.value);
          }}
          options={{
            initValue: settings.videoSpeed.value,
            ticks: 6,
            rangeMax: 5,
            rangeMin: 0,
            precision: 2,
            orientation: "horizontal",
            tickLabels: false,
          }}
        />
        {Object.entries(videoSpeedSelections)
          .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
          .map(([key, speed]) => (
            <div
              key={key}
              className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseFloat(speed) === settings.videoSpeed.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className='flex items-center justify-center grow'
                contentFunction={() => (
                  <div className='flex w-full bg-opacity-75 px-2 items-start'>
                    {speed}
                  </div>
                )}
                clickFunction={() => {
                  setVideoSpeed(parseFloat(speed));
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
