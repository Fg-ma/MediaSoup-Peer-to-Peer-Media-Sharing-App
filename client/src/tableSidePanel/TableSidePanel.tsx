import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useGeneralContext } from "../context/generalContext/GeneralContext";
import { SettingsSignals } from "../context/signalContext/lib/typeConstant";
import { IncomingTableStaticContentMessages } from "../serverControllers/tableStaticContentServer/lib/typeConstant";
import { IncomingMediasoupMessages } from "../serverControllers/mediasoupServer/lib/typeConstant";
import UploadingPanel from "./panels/uploadingPanel/UploadingPanel";
import TableController from "../table/lib/TableController";
import TableSidePanelHeader from "./lib/TableSidePanelHeader";
import FgScrollbarElement from "../elements/fgScrollbarElement/FgScrollbarElement";
import GeneralPanel from "./panels/generalPanel/GeneralPanel";
import SidePanelDragger from "./lib/SidePanelDragger";
import DownloadingPanel from "./panels/downloadingPanel/DownloadingPanel";
import { ContentTypes } from "../../../universal/contentTypeConstant";
import SettingsPanel from "./panels/settingsPanel/SettingsPanel";
import "./lib/tableSidePanel.css";

export type TableSidePanels = "upload" | "download" | "general" | "settings";

export default function TableSidePanel({
  tableSidePanelActive,
  setTableSidePanelActive,
  tableController,
  setExternalRerender,
  tableSidePanelWidth,
  setTableSidePanelWidth,
  sidePanelPosition,
  setSidePanelPosition,
}: {
  tableSidePanelActive: boolean;
  setTableSidePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  tableController: React.MutableRefObject<TableController>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
  tableSidePanelWidth: number;
  setTableSidePanelWidth: React.Dispatch<React.SetStateAction<number>>;
  sidePanelPosition: "left" | "right";
  setSidePanelPosition: React.Dispatch<React.SetStateAction<"left" | "right">>;
}) {
  const {
    sendSettingsSignal,
    addSettingsSignalListener,
    removeSettingsSignalListener,
  } = useSignalContext();
  const { tableStaticContentSocket, mediasoupSocket } = useSocketContext();
  const { activeSidePanel, currentSettingsActive } = useGeneralContext();

  const tablePanelRef = useRef<HTMLDivElement>(null);
  const tableSidePanelHeaderRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  useEffect(() => {
    tableController.current.getAspectDir();
  }, [tableSidePanelWidth]);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [activeSidePanel.current]);

  const handleSettingsSignals = (signal: SettingsSignals) => {
    switch (signal.type) {
      case "toggleSettingsPanel": {
        const { contentType, instanceId } = signal.header;

        setTableSidePanelActive(true);
        activeSidePanel.current = "settings";

        const idx = currentSettingsActive.current.findIndex(
          (active) =>
            contentType === active.contentType &&
            instanceId === active.instanceId,
        );

        if (idx === -1) {
          currentSettingsActive.current.push(signal.header);
        } else {
          currentSettingsActive.current.splice(idx, 1);
        }

        sendSettingsSignal({
          type: "sidePanelChanged",
        });

        setRerender((prev) => !prev);
        break;
      }
      default:
        break;
    }
  };

  const handleTableStaticContentMessages = (
    msg: IncomingTableStaticContentMessages,
  ) => {
    switch (msg.type) {
      case "contentDeleted":
        const { contentType, instanceId } = msg.header;
        const idx = currentSettingsActive.current.findIndex(
          (active) =>
            contentType === active.contentType &&
            instanceId === active.instanceId,
        );

        if (idx !== -1) {
          currentSettingsActive.current.splice(idx, 1);
          setRerender((prev) => !prev);
        }
        break;
    }
  };

  const handleMediasoupMessages = (msg: IncomingMediasoupMessages) => {
    switch (msg.type) {
      case "producerDisconnected":
        const { producerType, producerId } = msg.header;

        const idx = currentSettingsActive.current.findIndex(
          (active) =>
            producerType === active.contentType &&
            producerId === active.instanceId,
        );

        if (idx !== -1) {
          currentSettingsActive.current.splice(idx, 1);
          setRerender((prev) => !prev);
        }
        break;
    }
  };

  useEffect(() => {
    addSettingsSignalListener(handleSettingsSignals);

    return () => {
      removeSettingsSignalListener(handleSettingsSignals);
    };
  }, []);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      handleTableStaticContentMessages,
    );

    return () => {
      tableStaticContentSocket.current?.removeMessageListener(
        handleTableStaticContentMessages,
      );
    };
  }, [tableStaticContentSocket.current]);

  useEffect(() => {
    mediasoupSocket.current?.addMessageListener(handleMediasoupMessages);

    return () => {
      mediasoupSocket.current?.removeMessageListener(handleMediasoupMessages);
    };
  }, [mediasoupSocket.current]);

  useEffect(() => {
    if (tableSidePanelActive) {
      sendSettingsSignal({
        type: "sidePanelOpened",
      });
    } else {
      sendSettingsSignal({
        type: "sidePanelClosed",
      });
    }
  }, [tableSidePanelActive]);

  return (
    tableSidePanelActive && (
      <>
        <div
          className="table-side-panel flex h-full flex-col overflow-hidden rounded-md border-2 border-fg-off-white bg-fg-tone-black-6"
          style={
            {
              "--dynamic-width": `${Math.max(200, tableSidePanelWidth)}px`,
              maxWidth: "calc(70% - 1.75rem)",
            } as React.CSSProperties
          }
        >
          <TableSidePanelHeader
            tableSidePanelHeaderRef={tableSidePanelHeaderRef}
            setTableSidePanelActive={setTableSidePanelActive}
            setExternalRerender={setExternalRerender}
            sidePanelPosition={sidePanelPosition}
            setSidePanelPosition={setSidePanelPosition}
          />
          <FgScrollbarElement
            direction="vertical"
            scrollbarSize={8}
            gutterSize={8}
            style={{
              height: `calc(100% - ${tableSidePanelHeaderRef.current?.clientHeight ?? 0}px)`,
            }}
            externalContentContainerRef={tablePanelRef}
            contentContainerClassName="hide-scroll-bar h-full w-full overflow-y-auto"
            content={
              <>
                {activeSidePanel.current === "general" && (
                  <GeneralPanel tablePanelRef={tablePanelRef} />
                )}
                {activeSidePanel.current === "upload" && (
                  <UploadingPanel
                    tablePanelRef={tablePanelRef}
                    setExternalRerender={setRerender}
                  />
                )}
                {activeSidePanel.current === "download" && (
                  <DownloadingPanel
                    tablePanelRef={tablePanelRef}
                    setExternalRerender={setRerender}
                  />
                )}
                {activeSidePanel.current === "settings" && (
                  <SettingsPanel setExternalRerender={setRerender} />
                )}
              </>
            }
            scrollingContentRef={tablePanelRef}
          />
        </div>
        <SidePanelDragger
          setTableSidePanelWidth={setTableSidePanelWidth}
          tablePanelRef={tablePanelRef}
          sidePanelPosition={sidePanelPosition}
        />
      </>
    )
  );
}
