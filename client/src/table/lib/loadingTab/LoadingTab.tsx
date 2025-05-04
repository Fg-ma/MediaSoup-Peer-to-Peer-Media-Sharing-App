import React, { useEffect, useRef, useState } from "react";
import LoadingElement from "./lib/LoadingElement";
import { useUploadContext } from "../../../context/uploadContext/UploadContext";
import { UploadSignals } from "../../../context/uploadContext/lib/typeConstant";
import { TablePanels } from "../../../tableSidePanel/TableSidePanel";

export default function LoadingTab({
  activePanel,
  setActivePanel,
}: {
  activePanel: TablePanels | undefined;
  setActivePanel: React.Dispatch<React.SetStateAction<TablePanels | undefined>>;
}) {
  const {
    getCurrentUploads,
    addUploadSignalListener,
    removeUploadSignalListener,
  } = useUploadContext();

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
      case "uploadError":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const handleOpenLoadingPanel = () => {
    setActivePanel("loading");
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
        activePanel !== "loading" && (
          <div
            ref={loadingTabRef}
            className="hide-scroll-bar absolute bottom-0 left-0 z-upload-tab flex h-16 w-[11.25rem] items-center justify-start space-x-2 overflow-x-auto overflow-y-hidden rounded-bl-md rounded-tr-md border-2 border-fg-off-white bg-fg-tone-black-8 px-2"
            onClick={handleOpenLoadingPanel}
            onWheel={(event) => {
              if (loadingTabRef.current)
                loadingTabRef.current.scrollLeft += event.deltaY;
            }}
          >
            {Object.entries(getCurrentUploads()).map(([contentId, upload]) => (
              <LoadingElement
                key={contentId}
                contentId={contentId}
                upload={upload}
                loadingTabRef={loadingTabRef}
              />
            ))}
          </div>
        )}
    </>
  );
}
