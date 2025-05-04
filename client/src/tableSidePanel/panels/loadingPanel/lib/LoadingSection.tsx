import React, { useEffect, useState } from "react";
import {
  TableUpload,
  UploadSignals,
} from "../../../../context/uploadContext/lib/typeConstant";
import { useUploadContext } from "../../../../context/uploadContext/UploadContext";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";
import LoadingBar from "../../../../elements/loadingBar/LoadingBar";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const pauseIcon = nginxAssetServerBaseUrl + "svgs/pauseIcon.svg";
const playIcon = nginxAssetServerBaseUrl + "svgs/playIcon.svg";
const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function LoadingSection({
  contentId,
  upload,
  tablePanelRef,
}: {
  contentId: string;
  upload: TableUpload;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { addUploadSignalListener, removeUploadSignalListener } =
    useUploadContext();

  const [_, setRerender] = useState(false);

  const handleUploadListener = (signal: UploadSignals) => {
    if (signal.header.contentId !== contentId) return;

    switch (signal.type) {
      case "uploadProgress":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    addUploadSignalListener(handleUploadListener);

    return () => {
      removeUploadSignalListener(handleUploadListener);
    };
  }, []);

  return (
    <div className="flex h-max w-full flex-col items-start justify-center space-y-2 border-y-2 border-fg-tone-black-3 bg-fg-tone-black-5 py-4">
      <div className="flex h-8 w-full items-center justify-between pl-9 pr-10">
        <div className="h-full grow truncate font-K2D text-xl text-fg-white">
          {upload.filename}
        </div>
        <div className="flex h-full w-max items-center justify-center space-x-1">
          <FgButton
            className="flex aspect-square h-[90%] items-center justify-center"
            contentFunction={() => (
              <FgSVGElement
                src={upload.paused ? playIcon : pauseIcon}
                className="fill-fg-white stroke-fg-white"
                attributes={[
                  { key: "height", value: "100%" },
                  { key: "width", value: "100%" },
                ]}
              />
            )}
            scrollingContainerRef={tablePanelRef}
            hoverContent={
              <FgHoverContentStandard
                content={upload.paused ? "Resume upload" : "Pause upload"}
                style="light"
              />
            }
            options={{
              hoverSpacing: 4,
              hoverTimeoutDuration: 750,
              hoverType: "above",
            }}
          />
          <FgButton
            className="flex aspect-square h-[60%] items-center justify-center"
            contentFunction={() => (
              <FgSVGElement
                src={closeIcon}
                className="fill-fg-white stroke-fg-white"
                attributes={[
                  { key: "height", value: "100%" },
                  { key: "width", value: "100%" },
                ]}
              />
            )}
            scrollingContainerRef={tablePanelRef}
            hoverContent={
              <FgHoverContentStandard content="Cancel upload" style="light" />
            }
            options={{
              hoverSpacing: 4,
              hoverTimeoutDuration: 750,
              hoverType: "above",
            }}
          />
        </div>
      </div>
      <div className="w-full max-w-80 px-8">
        <LoadingBar className="h-3 w-full" progress={upload.progress * 100} />
      </div>
    </div>
  );
}
