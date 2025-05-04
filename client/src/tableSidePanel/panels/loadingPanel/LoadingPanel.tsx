import React, { useEffect, useState } from "react";
import { UploadSignals } from "../../../context/uploadContext/lib/typeConstant";
import { useUploadContext } from "../../../context/uploadContext/UploadContext";
import LoadingSection from "./lib/LoadingSection";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const relaxedIcon = nginxAssetServerBaseUrl + "svgs/relaxedIcon.svg";

export default function LoadingPanel({
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
  } = useUploadContext();

  const [_, setRerender] = useState(false);

  const handleUploadListener = (signal: UploadSignals) => {
    switch (signal.type) {
      case "uploadStart":
        setRerender((prev) => !prev);
        break;
      case "uploadFinish":
        setRerender((prev) => !prev);
        break;
      case "uploadError":
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
    <div className="flex h-full w-full flex-col space-y-4">
      {Object.entries(getCurrentUploads()).map(([contentId, upload]) => (
        <LoadingSection
          key={contentId}
          contentId={contentId}
          upload={upload}
          tablePanelRef={tablePanelRef}
        />
      ))}
      {Object.keys(getCurrentUploads()).length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <span className="text-center font-Josefin text-3xl text-fg-white">
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
