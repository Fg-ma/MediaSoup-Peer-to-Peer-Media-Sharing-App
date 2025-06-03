import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";

import TableVideoMediaInstance from "../../../../../../media/fgTableVideo/TableVideoMediaInstance";
import {
  downloadTypeOptionsArrays,
  downloadTypeOptionsTitles,
  DownloadTypeOptionsTypes,
} from "../../../../../../media/fgTableVideo/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadTypeOptionsPage({
  videoMediaInstance,
  setRerender,
}: {
  videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [activePages, setActivePages] = useState({
    fps: false,
    mimeType: false,
  });

  const fpsRef = useRef<HTMLDivElement>(null);
  const mimeTypeRef = useRef<HTMLDivElement>(null);
  const refs = {
    fps: fpsRef,
    mimeType: mimeTypeRef,
  };

  const handleOptionSelect = (
    option: keyof typeof downloadTypeOptionsTitles,
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages[option] = !newActivePages[option];

      return newActivePages;
    });
  };

  useEffect(() => {
    setRerender((prev) => !prev);
  }, []);

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 2rem)" }}
      ></div>
      {Object.keys(downloadTypeOptionsArrays).map((option) => (
        <>
          <FgButton
            key={option}
            className="h-7"
            style={{ width: "calc(100% - 2rem)" }}
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof downloadTypeOptionsArrays,
              )
            }
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                <div
                  ref={refs[option as keyof typeof downloadTypeOptionsArrays]}
                >
                  {
                    downloadTypeOptionsTitles[
                      option as keyof typeof downloadTypeOptionsArrays
                    ]
                  }
                </div>
                <div
                  className="flex items-center justify-center space-x-1"
                  style={{
                    width: `calc(100% - ${refs[option as keyof typeof downloadTypeOptionsArrays].current?.clientWidth ?? 0}px - 1rem)`,
                  }}
                >
                  <div
                    className="truncate text-end"
                    style={{ width: "calc(100% - 1.25rem)" }}
                  >
                    {
                      videoMediaInstance.current.settings.downloadType
                        .downloadTypeOptions[
                        option as keyof typeof downloadTypeOptionsArrays
                      ].value
                    }
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    className={`${activePages[option as keyof typeof downloadTypeOptionsTitles] ? "-scale-x-100" : ""} rotate-90`}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
          {activePages[option as keyof typeof downloadTypeOptionsTitles] && (
            <>
              <div
                className="h-0.5 rounded-full bg-fg-red-light"
                style={{ width: "calc(100% - 2.5rem)" }}
              ></div>
              {downloadTypeOptionsArrays[
                option as DownloadTypeOptionsTypes
              ].map((type) => (
                <FgButton
                  key={type}
                  className="h-7"
                  style={{ width: "calc(100% - 2.5rem)" }}
                  contentFunction={() => (
                    <div
                      className={`flex w-full items-center justify-start rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                        type ===
                        videoMediaInstance.current.settings.downloadType
                          .downloadTypeOptions[
                          option as DownloadTypeOptionsTypes
                        ].value
                          ? "bg-fg-white text-fg-tone-black-1"
                          : ""
                      }`}
                    >
                      {type}
                    </div>
                  )}
                  clickFunction={() => {
                    videoMediaInstance.current.settings.downloadType.downloadTypeOptions[
                      option as DownloadTypeOptionsTypes
                    ].value = type;

                    setRerender((prev) => !prev);
                  }}
                />
              ))}
            </>
          )}
        </>
      ))}
    </>
  );
}
