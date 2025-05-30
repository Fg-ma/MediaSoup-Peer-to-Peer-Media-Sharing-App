import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import GeneralMediaSelection from "../GeneralMediaSelection";
import {
  defaultSettings,
  Settings,
} from "../../../../../../../media/fgTableText/lib/typeConstant";
import { LoadingStateTypes } from "../../../../../../../../../universal/contentTypeConstant";
import TextSelectionController from "./lib/TextSelectionController";
import LoadingElement from "../../../../../../../elements/loadingElement/LoadingElement";
import DownloadFailed from "../../../../../../../elements/downloadFailed/DownloadFailed";
import DownloadPaused from "../../../../../../../elements/downloadPaused/DownloadPaused";
import { useSignalContext } from "../../../../../../../context/signalContext/SignalContext";
import Monaco from "../../../../../../../media/fgTableText/lib/monaco/Monaco";

export default function TextSelection({
  instanceId,
  tablePanelRef,
}: {
  instanceId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const { addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const textInstanceMedia = userMedia.current.text.tableInstances[instanceId];
  const positioning = textInstanceMedia?.getPositioning();

  const [loadingState, setLoadingState] = useState<LoadingStateTypes>(
    textInstanceMedia?.textMedia.loadingState,
  );
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );
  const [_, setRerender] = useState(false);

  const textSelectionController = new TextSelectionController(
    instanceId,
    setLoadingState,
    setRerender,
  );

  useEffect(() => {
    textInstanceMedia?.textMedia.addTextListener(
      textSelectionController.handleTextMessages,
    );

    addGroupSignalListener(textSelectionController.handleGroupSignal);

    return () => {
      textInstanceMedia?.textMedia.removeTextListener(
        textSelectionController.handleTextMessages,
      );

      removeGroupSignalListener(textSelectionController.handleGroupSignal);
    };
  }, []);

  return (
    textInstanceMedia && (
      <GeneralMediaSelection
        contentId={textInstanceMedia.textMedia.textId}
        instanceId={instanceId}
        contentType="text"
        selectionContentStyle={{ width: "calc(100% - 1rem)" }}
        selectionContent={
          loadingState === "downloaded" ? (
            textInstanceMedia.textMedia.fileSize < 1024 * 1024 * 5 ? (
              <Monaco
                settings={settings}
                isLineNums={false}
                isReadOnly={true}
                textMediaInstance={textInstanceMedia}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded bg-fg-tone-black-1 text-center font-K2D text-xl text-fg-white">
                Sorry no text preview
              </div>
            )
          ) : loadingState === "downloading" ? (
            <LoadingElement
              className="h-[12rem] w-full rounded-md"
              pauseDownload={
                textInstanceMedia.textMedia.liveTextDownloader?.pause
              }
            />
          ) : loadingState === "failed" ? (
            <DownloadFailed
              className="h-[12rem] w-full rounded-md"
              onClick={textInstanceMedia.textMedia.retryDownload}
            />
          ) : loadingState === "paused" ? (
            <DownloadPaused
              className="h-[12rem] w-full rounded-md"
              onClick={textInstanceMedia.textMedia.liveTextDownloader?.resume}
            />
          ) : undefined
        }
        filename={textInstanceMedia.textMedia.filename}
        mimeType={textInstanceMedia.textMedia.mimeType}
        fileSize={textInstanceMedia.textMedia.getFileSize()}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
        options={{ downloadType: "button" }}
      />
    )
  );
}
