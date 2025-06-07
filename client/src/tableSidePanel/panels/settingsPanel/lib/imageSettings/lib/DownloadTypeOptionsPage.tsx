import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";
import {
  downloadRecordingTypeOptionsArrays,
  downloadSnapShotTypeOptionsArrays,
} from "../../../../../../media/fgTableImage/lib/typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadTypeOptionsPage({
  imageMediaInstance,
}: {
  imageMediaInstance: React.MutableRefObject<TableImageMediaInstance>;
}) {
  const [fpsActive, setFpsActive] = useState(false);
  const [mimeTypeActive, setMimeTypeActive] = useState(false);
  const [qualityActive, setQualityActive] = useState(false);
  const fpsLabelRef = useRef<HTMLDivElement>(null);
  const mimeTypeLabelRef = useRef<HTMLDivElement>(null);
  const qualityLabelRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, []);

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 2rem)" }}
      ></div>
      {imageMediaInstance.current.settings.downloadType.value === "record" && (
        <>
          <FgButton
            className="h-7"
            style={{ width: "calc(100% - 2rem)" }}
            clickFunction={() => setFpsActive((prev) => !prev)}
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                <div ref={fpsLabelRef}>FPS</div>
                <div
                  className="flex items-center justify-center space-x-1"
                  style={{
                    width: `calc(100% - ${fpsLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
                  }}
                >
                  <div
                    className="truncate text-end"
                    style={{ width: "calc(100% - 1.25rem)" }}
                  >
                    {
                      imageMediaInstance.current.settings.downloadType
                        .downloadRecordTypeOptions.fps.value
                    }
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    className={`${fpsActive ? "-scale-x-100" : ""} rotate-90`}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
          {fpsActive && (
            <>
              <div
                className="h-0.5 rounded-full bg-fg-red-light"
                style={{ width: "calc(100% - 2.5rem)" }}
              ></div>
              {downloadRecordingTypeOptionsArrays.fps.map((type) => (
                <FgButton
                  key={type}
                  className={`rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                    type ===
                    imageMediaInstance.current.settings.downloadType
                      .downloadRecordTypeOptions.fps.value
                      ? "bg-fg-white text-fg-tone-black-1"
                      : ""
                  }`}
                  style={{ width: "calc(100% - 2.5rem)" }}
                  contentFunction={() => (
                    <div className="flex items-start justify-start">{type}</div>
                  )}
                  clickFunction={() => {
                    imageMediaInstance.current.settings.downloadType.downloadRecordTypeOptions.fps.value =
                      type;

                    setRerender((prev) => !prev);
                  }}
                />
              ))}
            </>
          )}
          <FgButton
            className="h-7"
            style={{ width: "calc(100% - 2rem)" }}
            clickFunction={() => setMimeTypeActive((prev) => !prev)}
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                <div ref={mimeTypeLabelRef}>Mime type</div>
                <div
                  className="flex items-center justify-center space-x-1"
                  style={{
                    width: `calc(100% - ${mimeTypeLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
                  }}
                >
                  <div
                    className="truncate text-end"
                    style={{ width: "calc(100% - 1.25rem)" }}
                  >
                    {
                      imageMediaInstance.current.settings.downloadType
                        .downloadRecordTypeOptions.mimeType.value
                    }
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    className={`${mimeTypeActive ? "-scale-x-100" : ""} rotate-90`}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
          {mimeTypeActive && (
            <>
              <div
                className="h-0.5 rounded-full bg-fg-red-light"
                style={{ width: "calc(100% - 2.5rem)" }}
              ></div>
              {downloadRecordingTypeOptionsArrays.mimeType.map((type) => (
                <FgButton
                  key={type}
                  className={`rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                    type ===
                    imageMediaInstance.current.settings.downloadType
                      .downloadRecordTypeOptions.mimeType.value
                      ? "bg-fg-white text-fg-tone-black-1"
                      : ""
                  }`}
                  style={{ width: "calc(100% - 2.5rem)" }}
                  contentFunction={() => (
                    <div className="flex items-start justify-start">{type}</div>
                  )}
                  clickFunction={() => {
                    imageMediaInstance.current.settings.downloadType.downloadRecordTypeOptions.mimeType.value =
                      type;

                    setRerender((prev) => !prev);
                  }}
                />
              ))}
            </>
          )}
        </>
      )}
      {imageMediaInstance.current.settings.downloadType.value ===
        "snapShot" && (
        <>
          <FgButton
            className="h-7"
            style={{ width: "calc(100% - 2rem)" }}
            clickFunction={() => setMimeTypeActive((prev) => !prev)}
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                <div ref={mimeTypeLabelRef}>Mime type</div>
                <div
                  className="flex items-center justify-center space-x-1"
                  style={{
                    width: `calc(100% - ${mimeTypeLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
                  }}
                >
                  <div
                    className="truncate text-end"
                    style={{ width: "calc(100% - 1.25rem)" }}
                  >
                    {
                      imageMediaInstance.current.settings.downloadType
                        .downloadSnapShotTypeOptions.mimeType.value
                    }
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    className={`${mimeTypeActive ? "-scale-x-100" : ""} rotate-90`}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
          {mimeTypeActive && (
            <>
              <div
                className="h-0.5 rounded-full bg-fg-red-light"
                style={{ width: "calc(100% - 2.5rem)" }}
              ></div>
              {downloadSnapShotTypeOptionsArrays.mimeType.map((type) => (
                <FgButton
                  key={type}
                  className={`rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                    type ===
                    imageMediaInstance.current.settings.downloadType
                      .downloadSnapShotTypeOptions.mimeType.value
                      ? "bg-fg-white text-fg-tone-black-1"
                      : ""
                  }`}
                  style={{ width: "calc(100% - 2.5rem)" }}
                  contentFunction={() => (
                    <div className="flex items-start justify-start">{type}</div>
                  )}
                  clickFunction={() => {
                    imageMediaInstance.current.settings.downloadType.downloadSnapShotTypeOptions.mimeType.value =
                      type;

                    setRerender((prev) => !prev);
                  }}
                />
              ))}
            </>
          )}
          <FgButton
            className="h-7"
            style={{ width: "calc(100% - 2rem)" }}
            clickFunction={() => setQualityActive((prev) => !prev)}
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                <div ref={qualityLabelRef}>Quality</div>
                <div
                  className="flex items-center justify-center space-x-1"
                  style={{
                    width: `calc(100% - ${qualityLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
                  }}
                >
                  <div
                    className="truncate text-end"
                    style={{ width: "calc(100% - 1.25rem)" }}
                  >
                    {imageMediaInstance.current.settings.downloadType.downloadSnapShotTypeOptions.quality.value.toFixed(
                      1,
                    )}
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    className={`${qualityActive ? "-scale-x-100" : ""} rotate-90`}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
          {qualityActive && (
            <>
              <div
                className="h-0.5 rounded-full bg-fg-red-light"
                style={{ width: "calc(100% - 2.5rem)" }}
              ></div>
              <FgSlider
                className="h-10"
                style={{ width: "calc(100% - 2.5rem)" }}
                externalValue={
                  imageMediaInstance.current.settings.downloadType
                    .downloadSnapShotTypeOptions.quality.value
                }
                externalStyleValue={
                  imageMediaInstance.current.settings.downloadType
                    .downloadSnapShotTypeOptions.quality.value
                }
                onValueChange={(value) => {
                  imageMediaInstance.current.settings.downloadType.downloadSnapShotTypeOptions.quality.value =
                    value.value;
                  setRerender((prev) => !prev);
                }}
                options={{
                  initValue:
                    imageMediaInstance.current.settings.downloadType
                      .downloadSnapShotTypeOptions.quality.value,
                  ticks: 6,
                  rangeMax: 1,
                  rangeMin: 0,
                  orientation: "horizontal",
                  tickLabels: false,
                  precision: 2,
                }}
              />
              {downloadSnapShotTypeOptionsArrays.quality.map((type) => (
                <FgButton
                  key={type}
                  className={`rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                    type ===
                    imageMediaInstance.current.settings.downloadType
                      .downloadSnapShotTypeOptions.quality.value
                      ? "bg-fg-white text-fg-tone-black-1"
                      : ""
                  }`}
                  style={{ width: "calc(100% - 2.5rem)" }}
                  contentFunction={() => (
                    <div className="flex items-start justify-start">{type}</div>
                  )}
                  clickFunction={() => {
                    imageMediaInstance.current.settings.downloadType.downloadSnapShotTypeOptions.quality.value =
                      type;

                    setRerender((prev) => !prev);
                  }}
                />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
