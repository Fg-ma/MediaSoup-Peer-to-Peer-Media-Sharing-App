import React, { useEffect, useState } from "react";
import { UploadSignals } from "../../../context/uploadDownloadContext/lib/typeConstant";
import { useUploadDownloadContext } from "../../../context/uploadDownloadContext/UploadDownloadContext";
import UploadingSection from "./lib/UploadingSection";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const relaxedIcon = nginxAssetServerBaseUrl + "svgs/relaxedIcon.svg";

export default function UploadingPanel({
  tablePanelRef,
  setExternalRerender,
}: {
  tablePanelRef: React.RefObject<HTMLDivElement>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    getCurrentUploads,
    addUploadSignalListener,
    removeUploadSignalListener,
  } = useUploadDownloadContext();

  const [_, setRerender] = useState(false);

  const handleUploadListener = (signal: UploadSignals) => {
    switch (signal.type) {
      case "uploadStart":
        setRerender((prev) => !prev);
        break;
      case "uploadFinish":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setExternalRerender((prev) => !prev);

    addUploadSignalListener(handleUploadListener);

    return () => {
      removeUploadSignalListener(handleUploadListener);
    };
  }, []);

  return (
    <div
      className={`${Object.keys(getCurrentUploads()).length === 0 ? "h-full" : "h-max"} flex w-full flex-col space-y-4`}
    >
      {Object.entries(getCurrentUploads()).map(([contentId, upload]) => (
        <UploadingSection
          key={contentId}
          upload={upload}
          tablePanelRef={tablePanelRef}
        />
      ))}
      {Object.keys(getCurrentUploads()).length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <span className="px-2 text-center font-Josefin text-3xl text-fg-white">
            No uploads found
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
