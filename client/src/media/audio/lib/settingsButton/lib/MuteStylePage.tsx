import React, { useRef } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  MuteStyleTypes,
  muteStylesMeta,
  ExtenalSVGsType,
} from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function MuteStylePage({
  setActivePages,
  settings,
  setSettings,
  setIsBezierCurveEditor,
  externalSVGs,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setIsBezierCurveEditor: React.Dispatch<React.SetStateAction<boolean>>;
  externalSVGs: ExtenalSVGsType;
}) {
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

  return (
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2'>
      <div className='flex h-6 w-full justify-start space-x-1'>
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
          clickFunction={handleCloseMuteStylePage}
        />
        <div
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleCloseMuteStylePage}
        >
          Mute style
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='w-full overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        <div className='flex w-full flex-col space-y-1 h-max'>
          <FgButton
            className='flex w-full text-nowrap bg-opacity-75 rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1'
            contentFunction={() => (
              <div className='flex justify-start w-full bg-opacity-75 px-2 items-center text-lg'>
                Make your own
              </div>
            )}
            clickFunction={() => setIsBezierCurveEditor((prev) => !prev)}
          />
          {externalSVGs.map((data) => (
            <FgButton
              key={data.id}
              className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                data.id === settings.muteStyle.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
              contentFunction={() => (
                <div
                  className={`${
                    data.name ? "justify-between" : "justify-start"
                  } flex w-full bg-opacity-75 px-2 items-center text-lg`}
                >
                  <>{data.name}</>
                  <FgSVG
                    src={data.url}
                    className='h-6 aspect-square'
                    attributes={[
                      { key: "height", value: "100%" },
                      { key: "width", value: "100%" },
                    ]}
                  />
                </div>
              )}
              clickFunction={() => {
                setMuteStyle(data.id);
              }}
            />
          ))}
          {Object.entries(muteStylesMeta).map(([key, meta]) => (
            <FgButton
              key={key}
              className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                key === settings.muteStyle.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
              contentFunction={() => (
                <div
                  className={`${
                    meta.url ? "justify-between" : "justify-start"
                  } flex w-full bg-opacity-75 px-2 items-center text-lg`}
                >
                  <>{meta.title}</>
                  {meta.url && (
                    <FgSVG
                      src={meta.url}
                      className='stroke-fg-white h-6 aspect-square'
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
