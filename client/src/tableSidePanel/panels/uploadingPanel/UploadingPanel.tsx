import React, { useEffect, useState } from "react";
import { UploadSignals } from "../../../context/uploadDownloadContext/lib/typeConstant";
import { useUploadDownloadContext } from "../../../context/uploadDownloadContext/UploadDownloadContext";
import UploadingSection from "./lib/UploadingSection";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import { useToolsContext } from "../../../context/toolsContext/ToolsContext";
import FailedUploadingSection from "./lib/FailedUploadingSection";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import { HandleListenerTypes } from "../../../db/indexedDB/lib/uploads/typeConstant";

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
  const { tableId } = useUserInfoContext();

  const [handles, setHandles] = useState<
    {
      key: string;
      tableId: string;
      uploadId: string;
      offset: number;
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
      case "uploadProcessing":
        setRerender((prev) => !prev);
        break;
      case "uploadProcessingFinished":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const handleHandleListener = (message: HandleListenerTypes) => {
    switch (message.type) {
      case "handleAdded":
        if (message.header.tableId !== tableId.current)
          setHandles((prev) => [
            ...prev,
            { ...message.header, ...message.data },
          ]);
        break;
      case "handleDeleted":
        setHandles((prev) =>
          prev.filter((val) => val.key !== message.header.key),
        );
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchHandles = async () => {
      if (indexedDBController.current) {
        const allHandles =
          await indexedDBController.current.uploadGets?.getAllFileHandles();
        if (allHandles) setHandles(allHandles);
      }
    };

    fetchHandles();

    setExternalRerender((prev) => !prev);

    indexedDBController.current.addHandleObjStoreListener(handleHandleListener);

    addUploadSignalListener(handleUploadListener);

    return () => {
      indexedDBController.current.removeHandleObjStoreListener(
        handleHandleListener,
      );
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
          !currentUploads.some(([contentId, _]) => contentId === handle.key) &&
          handle.tableId === tableId.current && (
            <FailedUploadingSection
              key={handle.key}
              savedTableId={handle.tableId}
              uploadId={handle.uploadId}
              contentId={handle.key}
              offset={handle.offset}
              failed={handle.handle}
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
      {handles.length === 0 && currentUploads.length === 0 && (
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
