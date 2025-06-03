import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import TableSvgMediaInstance from "../../../../../../media/fgTableSvg/TableSvgMediaInstance";
import {
  DownloadCompressionTypes,
  downloadOptionsArrays,
} from "../../../../../../media/fgTableSvg/lib/typeConstant";

export default function CompressionPage({
  svgMediaInstance,
  setRerender,
}: {
  svgMediaInstance: React.MutableRefObject<TableSvgMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const setCompression = (compression: DownloadCompressionTypes) => {
    svgMediaInstance.current.settings.downloadOptions.compression.value =
      compression;
    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 2rem)" }}
      ></div>
      {downloadOptionsArrays.compression.map((compression) => (
        <FgButton
          key={compression}
          className={`flex items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
            compression ===
            svgMediaInstance.current.settings.downloadOptions.compression.value
              ? "bg-fg-white text-fg-tone-black-1"
              : ""
          }`}
          style={{ width: "calc(100% - 2rem)" }}
          contentFunction={() => (
            <div className="flex w-full items-start px-4">{compression}</div>
          )}
          clickFunction={() => {
            setCompression(compression);
          }}
        />
      ))}
    </>
  );
}
