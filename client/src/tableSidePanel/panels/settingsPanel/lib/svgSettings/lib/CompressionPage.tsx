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
      <div className="h-0.5 w-[95%] rounded-full bg-fg-red-light"></div>
      {downloadOptionsArrays.compression.map((compression) => (
        <div
          key={compression}
          className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
            compression ===
            svgMediaInstance.current.settings.downloadOptions.compression.value
              ? "bg-fg-white text-fg-tone-black-1"
              : ""
          }`}
        >
          <FgButton
            className="flex grow items-center justify-center"
            contentFunction={() => (
              <div className="flex w-full items-start px-4">{compression}</div>
            )}
            clickFunction={() => {
              setCompression(compression);
            }}
          />
        </div>
      ))}
    </>
  );
}
