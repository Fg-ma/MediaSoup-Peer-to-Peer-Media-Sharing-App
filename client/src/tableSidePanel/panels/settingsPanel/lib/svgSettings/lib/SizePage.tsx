import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";
import TableSvgMediaInstance from "../../../../../../media/fgTableSvg/TableSvgMediaInstance";
import { downloadOptionsArrays } from "../../../../../../media/fgTableSvg/lib/typeConstant";

export default function SizePage({
  svgMediaInstance,
  setRerender,
}: {
  svgMediaInstance: React.MutableRefObject<TableSvgMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const setSize = (type: "width" | "height", value: number) => {
    svgMediaInstance.current.settings.downloadOptions.size[type].value = value;
  };

  const handleToggleAspect = () => {
    if (
      svgMediaInstance.current.settings.downloadOptions.size.value === "free"
    ) {
      svgMediaInstance.current.settings.downloadOptions.size.value = "aspect";
      setSize(
        "height",
        Math.min(
          4096,
          svgMediaInstance.current.settings.downloadOptions.size.width.value /
            (svgMediaInstance.current.svgMedia.aspect ?? 1),
        ),
      );
    } else {
      svgMediaInstance.current.settings.downloadOptions.size.value = "free";
    }
    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 2rem)" }}
      ></div>
      <FgButton
        className="flex h-7 items-center justify-center"
        style={{ width: "calc(100% - 2rem)" }}
        contentFunction={() => (
          <div
            className={`${
              svgMediaInstance.current.settings.downloadOptions.size.value ===
              "aspect"
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            } w-full max-w-44 truncate text-nowrap rounded px-2 text-center text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
          >
            {svgMediaInstance.current.settings.downloadOptions.size.value ===
            "aspect"
              ? "Disable aspect"
              : "Enable aspect"}
          </div>
        )}
        clickFunction={handleToggleAspect}
      />
      <FgSlider
        style={{ height: "2.5rem", width: "calc(100% - 2rem)" }}
        externalValue={
          svgMediaInstance.current.settings.downloadOptions.size.width.value
        }
        externalStyleValue={
          svgMediaInstance.current.settings.downloadOptions.size.width.value
        }
        onValueChange={(value) => {
          setSize("width", value.value);
          if (
            svgMediaInstance.current.settings.downloadOptions.size.value ===
            "aspect"
          ) {
            setSize(
              "height",
              value.value / (svgMediaInstance.current.svgMedia.aspect ?? 1),
            );
          }
          setRerender((prev) => !prev);
        }}
        options={{
          initValue:
            svgMediaInstance.current.settings.downloadOptions.size.width.value,
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
        style={{ height: "2.5rem", width: "calc(100% - 2rem)" }}
        externalValue={
          svgMediaInstance.current.settings.downloadOptions.size.height.value
        }
        externalStyleValue={
          svgMediaInstance.current.settings.downloadOptions.size.height.value
        }
        onValueChange={(value) => {
          setSize("height", value.value);
          if (
            svgMediaInstance.current.settings.downloadOptions.size.value ===
            "aspect"
          ) {
            setSize(
              "width",
              value.value * (svgMediaInstance.current.svgMedia.aspect ?? 1),
            );
          }
          setRerender((prev) => !prev);
        }}
        options={{
          initValue:
            svgMediaInstance.current.settings.downloadOptions.size.height.value,
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
        <FgButton
          key={size}
          className={`flex items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
            parseInt(size) ===
              svgMediaInstance.current.settings.downloadOptions.size.width
                .value &&
            svgMediaInstance.current.settings.downloadOptions.size.value ===
              "aspect"
              ? "bg-fg-white text-fg-tone-black-1"
              : ""
          }`}
          style={{ width: "calc(100% - 2rem)" }}
          contentFunction={() => (
            <div className="w-full truncate px-4 text-start">
              {(svgMediaInstance.current.getAspect() ?? 1) > 1
                ? size
                : (
                    parseInt(size) *
                    (svgMediaInstance.current.svgMedia.aspect ?? 1)
                  ).toFixed(0)}
              x
              {(svgMediaInstance.current.getAspect() ?? 1) > 1
                ? (
                    parseInt(size) /
                    (svgMediaInstance.current.svgMedia.aspect ?? 1)
                  ).toFixed(0)
                : size}
            </div>
          )}
          clickFunction={() => {
            setSize(
              "width",
              parseInt(
                (svgMediaInstance.current.getAspect() ?? 1) > 1
                  ? size
                  : (
                      parseInt(size) *
                      (svgMediaInstance.current.svgMedia.aspect ?? 1)
                    ).toFixed(0),
              ),
            );
            setSize(
              "height",
              (svgMediaInstance.current.getAspect() ?? 1) > 1
                ? parseInt(size) /
                    (svgMediaInstance.current.svgMedia.aspect ?? 1)
                : parseInt(size),
            );
            setRerender((prev) => !prev);
          }}
        />
      ))}
    </>
  );
}
