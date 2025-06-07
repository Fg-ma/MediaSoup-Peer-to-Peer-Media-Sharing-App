import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  ActivePages,
  downloadRecordTypeOptionsTitles,
  downloadRecordingTypeOptionsArrays,
  downloadSnapShotTypeOptionsArrays,
  downloadSnapShotTypeOptionsTitles,
} from "../../../typeConstant";
import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadTypeOptionsPage({
  imageMediaInstance,
  activePages,
  setActivePages,
}: {
  imageMediaInstance: TableImageMediaInstance;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
}) {
  const handleRecordTypeOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      if (newActivePages.downloadType.downloadRecordTypeOptions.active) {
        newActivePages.downloadType.downloadRecordTypeOptions.active = false;
      } else if (
        newActivePages.downloadType.downloadSnapShotTypeOptions.active
      ) {
        newActivePages.downloadType.downloadSnapShotTypeOptions.active = false;
      }

      return newActivePages;
    });
  };

  const handleRecordOptionSelect = (
    option: keyof typeof downloadRecordTypeOptionsTitles,
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.downloadRecordTypeOptions[option].active =
        !newActivePages.downloadType.downloadRecordTypeOptions[option].active;

      return newActivePages;
    });
  };

  const handleSnapShotOptionSelect = (
    option: keyof typeof downloadSnapShotTypeOptionsTitles,
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.downloadSnapShotTypeOptions[option].active =
        !newActivePages.downloadType.downloadSnapShotTypeOptions[option].active;

      return newActivePages;
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2 font-K2D">
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
          clickFunction={handleRecordTypeOptionsActive}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleRecordTypeOptionsActive}
        >
          Options
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col justify-start space-y-1 overflow-y-auto px-2">
        {activePages.downloadType.downloadRecordTypeOptions.active &&
          Object.keys(downloadRecordingTypeOptionsArrays).map((option) => (
            <FgButton
              key={option}
              className="h-8 w-full"
              clickFunction={() =>
                handleRecordOptionSelect(
                  option as keyof typeof downloadRecordingTypeOptionsArrays,
                )
              }
              contentFunction={() => (
                <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                  <div>
                    {
                      downloadRecordTypeOptionsTitles[
                        option as keyof typeof downloadRecordingTypeOptionsArrays
                      ]
                    }
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <div>
                      {
                        imageMediaInstance.settings.downloadType
                          .downloadRecordTypeOptions[
                          option as keyof typeof downloadRecordingTypeOptionsArrays
                        ].value
                      }
                    </div>
                    <FgSVGElement
                      src={navigateForwardIcon}
                      attributes={[
                        { key: "width", value: "1.25rem" },
                        { key: "height", value: "1.25rem" },
                      ]}
                    />
                  </div>
                </div>
              )}
            />
          ))}
        {activePages.downloadType.downloadSnapShotTypeOptions.active &&
          Object.keys(downloadSnapShotTypeOptionsArrays).map((option) => (
            <FgButton
              key={option}
              className="h-8 w-full"
              clickFunction={() =>
                handleSnapShotOptionSelect(
                  option as keyof typeof downloadSnapShotTypeOptionsArrays,
                )
              }
              contentFunction={() => (
                <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                  <div>
                    {
                      downloadSnapShotTypeOptionsTitles[
                        option as keyof typeof downloadSnapShotTypeOptionsArrays
                      ]
                    }
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <div>
                      {option === "quality"
                        ? imageMediaInstance.settings.downloadType.downloadSnapShotTypeOptions.quality.value.toFixed(
                            1,
                          )
                        : imageMediaInstance.settings.downloadType
                            .downloadSnapShotTypeOptions[
                            option as keyof typeof downloadSnapShotTypeOptionsArrays
                          ].value}
                    </div>
                    <FgSVGElement
                      src={navigateForwardIcon}
                      attributes={[
                        { key: "width", value: "1.25rem" },
                        { key: "height", value: "1.25rem" },
                      ]}
                    />
                  </div>
                </div>
              )}
            />
          ))}
      </div>
    </div>
  );
}
