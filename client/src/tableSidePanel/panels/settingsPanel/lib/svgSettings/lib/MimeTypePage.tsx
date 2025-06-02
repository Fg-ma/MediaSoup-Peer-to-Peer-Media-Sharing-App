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
      <div className="h-0.5 w-[95%] rounded-full bg-fg-red-light"></div>
      {downloadOptionsArrays.mimeType.map((mimeType) => (
        <div
          key={mimeType}
          className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
            mimeType ===
            svgMediaInstance.current.settings.downloadOptions.mimeType.value
              ? "bg-fg-white text-fg-tone-black-1"
              : ""
          }`}
        >
          <FgButton
            className="flex grow items-center justify-center"
            contentFunction={() => (
              <div className="flex w-full items-start px-4">{mimeType}</div>
            )}
            clickFunction={() => {
              setMimeType(mimeType);
            }}
          />
        </div>
      ))}
    </>
  );
}
