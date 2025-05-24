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
import MonacoTextArea from "../../../../../../../media/fgTableText/lib/monaco/MonacoTextArea";

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

  const text = useRef(textInstanceMedia.instanceText ?? "");

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
            <MonacoTextArea
              initialText={text.current}
              settings={settings}
              isLineNums={false}
              textMediaInstance={textInstanceMedia}
            />
          ) : loadingState === "downloading" ? (
            <LoadingElement
              className="h-[12rem] w-full rounded-md"
              pauseDownload={textInstanceMedia.textMedia.downloader?.pause}
            />
          ) : loadingState === "failed" ? (
            <DownloadFailed
              className="h-[12rem] w-full rounded-md"
              onClick={textInstanceMedia.textMedia.retryDownload}
            />
          ) : loadingState === "paused" ? (
            <DownloadPaused
              className="h-[12rem] w-full rounded-md"
              onClick={textInstanceMedia.textMedia.downloader?.resume}
            />
          ) : (
            <></>
          )
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
