import React, { useEffect, useState } from "react";
import {
  DownloadSignals,
  UploadSignals,
} from "../../../context/uploadDownloadContext/lib/typeConstant";
import { useUploadDownloadContext } from "../../../context/uploadDownloadContext/UploadDownloadContext";
import DownloadingSection from "./lib/DownloadingSection";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const relaxedIcon = nginxAssetServerBaseUrl + "svgs/relaxedIcon.svg";

export default function DownloadingPanel({
  tablePanelRef,
  setExternalRerender,
}: {
  tablePanelRef: React.RefObject<HTMLDivElement>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    getCurrentDownloads,
    addDownloadSignalListener,
    removeDownloadSignalListener,
  } = useUploadDownloadContext();

  const [_, setRerender] = useState(false);

  const handleDownloadListener = (signal: DownloadSignals) => {
    switch (signal.type) {
      case "downloadStart":
        setRerender((prev) => !prev);
        break;
      case "downloadFinish":
        setRerender((prev) => !prev);
        break;
      case "downloadError":
        setRerender((prev) => !prev);
        break;
      case "downloadCancel":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setExternalRerender((prev) => !prev);

    addDownloadSignalListener(handleDownloadListener);

    return () => {
      removeDownloadSignalListener(handleDownloadListener);
    };
  }, []);

  return (
    <div
      className={`${Object.keys(getCurrentDownloads()).length === 0 ? "h-full" : "h-max"} flex w-full flex-col space-y-4`}
    >
      {Object.entries(getCurrentDownloads()).map(([contentId, download]) => (
        <DownloadingSection
          key={contentId}
          download={download}
          tablePanelRef={tablePanelRef}
        />
      ))}
      {Object.keys(getCurrentDownloads()).length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <span className="px-2 text-center font-Josefin text-3xl text-fg-white">
            No downloads found
          </span>
          <FgSVGElement
            src={relaxedIcon}
            className="aspect-square w-[60%] max-w-96 fill-fg-white stroke-fg-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
