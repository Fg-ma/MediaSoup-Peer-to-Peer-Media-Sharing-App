import React, { useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import { ActivePages, downloadOptionsArrays } from "../../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";
import TableSvgMediaInstance from "../../../../TableSvgMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function SizePage({
  svgMediaInstance,
  setActivePages,
}: {
  svgMediaInstance: TableSvgMediaInstance;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
}) {
  const [_, setRerender] = useState(false);

  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setSize = (type: "width" | "height", value: number) => {
    svgMediaInstance.settings.downloadOptions.size[type].value = value;
  };

  const handleCloseSizePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions.size.active =
        !newActivePages.downloadOptions.size.active;

      return newActivePages;
    });
  };

  const handleToggleAspect = () => {
    if (svgMediaInstance.settings.downloadOptions.size.value === "free") {
      svgMediaInstance.settings.downloadOptions.size.value = "aspect";
      setSize(
        "height",
        Math.min(
          4096,
          svgMediaInstance.settings.downloadOptions.size.width.value /
            (svgMediaInstance.svgMedia.aspect ?? 1),
        ),
      );
    } else {
      svgMediaInstance.settings.downloadOptions.size.value = "free";
    }

    setRerender((prev) => !prev);
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
            clickFunction={handleCloseSizePage}
          />
          <div
            className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
            onClick={handleCloseSizePage}
          >
            Size
          </div>
        </div>
        <div></div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div
        ref={scrollingContainerRef}
        className="small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full items-start justify-center overflow-y-auto"
      >
        <div className="flex h-max w-full flex-col space-y-1 px-2">
          <FgButton
            className="h-7 w-full"
            contentFunction={() => (
              <div
                className={`${
                  svgMediaInstance.settings.downloadOptions.size.value ===
                  "aspect"
                    ? "bg-fg-white text-fg-tone-black-1"
                    : ""
                } flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
              >
                {svgMediaInstance.settings.downloadOptions.size.value ===
                "aspect"
                  ? "Disable aspect"
                  : "Enable aspect"}
              </div>
            )}
            clickFunction={handleToggleAspect}
          />
          <FgSlider
            style={{ height: "2.5rem" }}
            externalValue={
              svgMediaInstance.settings.downloadOptions.size.width.value
            }
            externalStyleValue={
              svgMediaInstance.settings.downloadOptions.size.width.value
            }
            onValueChange={(value) => {
              setSize("width", value.value);
              if (
                svgMediaInstance.settings.downloadOptions.size.value ===
                "aspect"
              ) {
                setSize(
                  "height",
                  value.value / (svgMediaInstance.svgMedia.aspect ?? 1),
                );
              }
              setRerender((prev) => !prev);
            }}
            options={{
              initValue:
                svgMediaInstance.settings.downloadOptions.size.width.value,
              ticks: 5,
              rangeMax: 4096,
              rangeMin: 1,
              orientation: "horizontal",
              tickLabels: false,
              precision: 0,
              snapToWholeNum: true,
              topLabel: "Width",
              labelsColor: "#f2f2f2",
            }}
          />
          <FgSlider
            style={{ height: "2.5rem" }}
            externalValue={
              svgMediaInstance.settings.downloadOptions.size.height.value
            }
            externalStyleValue={
              svgMediaInstance.settings.downloadOptions.size.height.value
            }
            onValueChange={(value) => {
              setSize("height", value.value);
              if (
                svgMediaInstance.settings.downloadOptions.size.value ===
                "aspect"
              ) {
                setSize(
                  "width",
                  value.value * (svgMediaInstance.svgMedia.aspect ?? 1),
                );
              }
              setRerender((prev) => !prev);
            }}
            options={{
              initValue:
                svgMediaInstance.settings.downloadOptions.size.height.value,
              ticks: 5,
              rangeMax: 4096,
              rangeMin: 1,
              orientation: "horizontal",
              tickLabels: false,
              precision: 0,
              snapToWholeNum: true,
              topLabel: "Height",
              labelsColor: "#f2f2f2",
            }}
          />
          {downloadOptionsArrays.size.map((size) => (
            <div
              key={size}
              className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseInt(size) ===
                  svgMediaInstance.settings.downloadOptions.size.width.value &&
                svgMediaInstance.settings.downloadOptions.size.value ===
                  "aspect"
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className="flex grow items-center justify-center"
                contentFunction={() => (
                  <div className="flex w-full items-start px-2">
                    {(svgMediaInstance.getAspect() ?? 1) > 1
                      ? size
                      : (
                          parseInt(size) *
                          (svgMediaInstance.svgMedia.aspect ?? 1)
                        ).toFixed(0)}
                    x
                    {(svgMediaInstance.getAspect() ?? 1) > 1
                      ? (
                          parseInt(size) /
                          (svgMediaInstance.svgMedia.aspect ?? 1)
                        ).toFixed(0)
                      : size}
                  </div>
                )}
                clickFunction={() => {
                  setSize(
                    "width",
                    parseInt(
                      (svgMediaInstance.getAspect() ?? 1) > 1
                        ? size
                        : (
                            parseInt(size) *
                            (svgMediaInstance.svgMedia.aspect ?? 1)
                          ).toFixed(0),
                    ),
                  );
                  setSize(
                    "height",
                    (svgMediaInstance.getAspect() ?? 1) > 1
                      ? parseInt(size) / (svgMediaInstance.svgMedia.aspect ?? 1)
                      : parseInt(size),
                  );
                  setRerender((prev) => !prev);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
