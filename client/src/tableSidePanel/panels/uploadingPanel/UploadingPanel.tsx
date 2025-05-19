import React, { useEffect, useState } from "react";
import { UploadSignals } from "../../../context/uploadDownloadContext/lib/typeConstant";
import { useUploadDownloadContext } from "../../../context/uploadDownloadContext/UploadDownloadContext";
import UploadingSection from "./lib/UploadingSection";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import { useToolsContext } from "../../../context/toolsContext/ToolsContext";
import FailedUploadingSection from "./lib/FailedUploadingSection";

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
  const { indexedDBController } = useToolsContext();

  const [handles, setHandles] = useState<
    {
      key: string;
      handle: FileSystemFileHandle;
    }[]
  >([]);
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
    const fetchHandles = async () => {
      if (indexedDBController.current) {
        const allHandles =
          await indexedDBController.current.getAllFileHandles();
        if (allHandles) setHandles(allHandles);
      }
    };

    fetchHandles();

    setExternalRerender((prev) => !prev);

    addUploadSignalListener(handleUploadListener);

    return () => {
      removeUploadSignalListener(handleUploadListener);
    };
  }, []);

  const currentUploads = Object.entries(getCurrentUploads());

  return (
    <div
      className={`${currentUploads.length === 0 ? "h-full" : "h-max"} flex w-full flex-col space-y-4`}
    >
      {handles.map(
        (handle) =>
          !currentUploads.some(
            ([contentId, _]) => contentId === handle.key,
          ) && (
            <FailedUploadingSection
              key={handle.key}
              failed={handle.handle}
              contentId={handle.key}
            />
          ),
      )}
      {currentUploads.map(([contentId, upload]) => (
        <UploadingSection
          key={contentId}
          upload={upload}
          tablePanelRef={tablePanelRef}
        />
      ))}
      {currentUploads.length === 0 && (
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
