import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import TableVideoMediaInstance from "../../../../../../media/fgTableVideo/TableVideoMediaInstance";
import { downloadTypeSelections } from "../../../../../../media/fgTableVideo/lib/typeConstant";
import DownloadTypeOptionsPage from "./DownloadTypeOptionsPage";

export default function DownloadTypePage({
  videoMediaInstance,
  setRerender,
}: {
  videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const setDownloadType = (
    downloadType: keyof typeof downloadTypeSelections,
  ) => {
    videoMediaInstance.current.settings.downloadType.value = downloadType;

    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 1rem)" }}
      ></div>
      {Object.entries(downloadTypeSelections).map(([key, type]) => (
        <>
          <FgButton
            key={key}
            className="h-7"
            style={{ width: "calc(100% - 1rem)" }}
            contentFunction={() => (
              <div
                className={`flex w-full items-center justify-start text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                  key === videoMediaInstance.current.settings.downloadType.value
                    ? "bg-fg-white text-fg-tone-black-1"
                    : "text-fg-white"
                }`}
              >
                {type}
              </div>
            )}
            clickFunction={() =>
              setDownloadType(key as keyof typeof downloadTypeSelections)
            }
          />
          {key === "record" &&
            videoMediaInstance.current.settings.downloadType.value ===
              "record" && (
              <DownloadTypeOptionsPage
                videoMediaInstance={videoMediaInstance}
                setRerender={setRerender}
              />
            )}
        </>
      ))}
    </>
  );
}
