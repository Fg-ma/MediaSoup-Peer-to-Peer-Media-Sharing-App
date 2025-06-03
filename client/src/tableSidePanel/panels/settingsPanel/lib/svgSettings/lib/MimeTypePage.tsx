import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import TableSvgMediaInstance from "../../../../../../media/fgTableSvg/TableSvgMediaInstance";
import {
  DownloadMimeTypes,
  downloadOptionsArrays,
} from "../../../../../../media/fgTableSvg/lib/typeConstant";

export default function MimeTypePage({
  svgMediaInstance,
  setRerender,
}: {
  svgMediaInstance: React.MutableRefObject<TableSvgMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const setMimeType = (mimeType: DownloadMimeTypes) => {
    svgMediaInstance.current.settings.downloadOptions.mimeType.value = mimeType;
    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 2rem)" }}
      ></div>
      {downloadOptionsArrays.mimeType.map((mimeType) => (
        <FgButton
          key={mimeType}
          className={`flex items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
            mimeType ===
            svgMediaInstance.current.settings.downloadOptions.mimeType.value
              ? "bg-fg-white text-fg-tone-black-1"
              : ""
          }`}
          style={{ width: "calc(100% - 2rem)" }}
          contentFunction={() => (
            <div className="flex w-full items-start px-4">{mimeType}</div>
          )}
          clickFunction={() => {
            setMimeType(mimeType);
          }}
        />
      ))}
    </>
  );
}
