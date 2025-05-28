import React, { useEffect, useRef, useState } from "react";
import LoadingElement from "./lib/LoadingElement";
import { useUploadDownloadContext } from "../../../context/uploadDownloadContext/UploadDownloadContext";
import { UploadSignals } from "../../../context/uploadDownloadContext/lib/typeConstant";
import { TablePanels } from "../../../tableSidePanel/TableSidePanel";

export default function LoadingTab({
  activePanel,
  tableSidePanelActive,
  setTableSidePanelActive,
  setExternalRerender,
}: {
  activePanel: React.MutableRefObject<TablePanels>;
  tableSidePanelActive: boolean;
  setTableSidePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    getCurrentUploads,
    addUploadSignalListener,
    removeUploadSignalListener,
  } = useUploadDownloadContext();

  const [_, setRerender] = useState(false);
  const loadingTabRef = useRef<HTMLDivElement>(null);

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

  const handleOpenLoadingPanel = () => {
    activePanel.current = "upload";
    setTableSidePanelActive(true);
    setExternalRerender((prev) => !prev);
  };

  useEffect(() => {
    addUploadSignalListener(handleUploadListener);

    return () => {
      removeUploadSignalListener(handleUploadListener);
    };
  }, []);

  return (
    <>
      {Object.keys(getCurrentUploads()).length !== 0 &&
        (activePanel.current !== "upload" || !tableSidePanelActive) && (
          <div
            ref={loadingTabRef}
            className="hide-scroll-bar absolute bottom-0 left-0 z-upload-tab flex h-16 w-max max-w-[11.25rem] items-center justify-start space-x-2 overflow-x-auto overflow-y-hidden rounded-bl-md rounded-tr-md border-2 border-fg-off-white bg-fg-tone-black-8 px-2"
            onClick={handleOpenLoadingPanel}
            onWheel={(event) => {
              if (loadingTabRef.current)
                loadingTabRef.current.scrollLeft += event.deltaY;
            }}
          >
            {Object.entries(getCurrentUploads()).map(([contentId, upload]) => (
              <LoadingElement
                key={contentId}
                upload={upload}
                loadingTabRef={loadingTabRef}
              />
            ))}
          </div>
        )}
    </>
  );
}
