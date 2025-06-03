import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { IncomingTableStaticContentMessages } from "../serverControllers/tableStaticContentServer/lib/typeConstant";
import { SettingsSignals } from "../context/signalContext/lib/typeConstant";
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
import { IncomingMediasoupMessages } from "src/serverControllers/mediasoupServer/lib/typeConstant";

export type TableSidePanels = "upload" | "download" | "general" | "settings";

export default function TableSidePanel({
  activePanel,
  tableSidePanelActive,
  setTableSidePanelActive,
  tableController,
  setExternalRerender,
  tableSidePanelWidth,
  setTableSidePanelWidth,
  sidePanelPosition,
  setSidePanelPosition,
}: {
  activePanel: React.MutableRefObject<TableSidePanels>;
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

  const tablePanelRef = useRef<HTMLDivElement>(null);
  const tableSidePanelHeaderRef = useRef<HTMLDivElement>(null);
  const currentSettingsActive = useRef<
    | {
        contentType: ContentTypes;
        instanceId: string;
        visualMediaInfo?: {
          isUser: boolean;
          username: string;
          instance: string;
        };
      }
    | undefined
  >(undefined);

  const [_, setRerender] = useState(false);

  useEffect(() => {
    tableController.current.getAspectDir();
  }, [tableSidePanelWidth]);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [activePanel.current]);

  const handleSettingsSignals = (signal: SettingsSignals) => {
    switch (signal.type) {
      case "toggleSettingsPanel": {
        const { contentType, instanceId } = signal.header;

        const condition =
          activePanel.current !== "settings" ||
          !currentSettingsActive.current ||
          contentType !== currentSettingsActive.current.contentType ||
          instanceId !== currentSettingsActive.current.instanceId;

        setTableSidePanelActive(condition);

        currentSettingsActive.current = condition ? signal.header : undefined;
        activePanel.current = condition ? "settings" : "general";

        sendSettingsSignal({
          type: "sidePanelChanged",
          header: {
            activePanel: activePanel.current,
            currentSettingsActive: currentSettingsActive.current,
          },
        });

        setRerender((prev) => !prev);
        break;
      }
      case "requestSidePanelState": {
        const { contentType, instanceId } = signal.header;

        sendSettingsSignal({
          type: "respondedSidePanelState",
          header: { contentType, instanceId, activePanel: activePanel.current },
        });
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
        if (
          instanceId === currentSettingsActive.current?.instanceId &&
          contentType === currentSettingsActive.current?.contentType
        ) {
          currentSettingsActive.current = undefined;
          setRerender((prev) => !prev);
        }
        break;
    }
  };

  const handleMediasoupMessages = (msg: IncomingMediasoupMessages) => {
    switch (msg.type) {
      case "producerDisconnected":
        const { producerType, producerId, dataStreamType } = msg.header;
        if (
          producerId === currentSettingsActive.current?.instanceId &&
          producerType === currentSettingsActive.current?.contentType &&
          dataStreamType === undefined
        ) {
          currentSettingsActive.current = undefined;
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
        header: { activePanel: activePanel.current },
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
            activePanel={activePanel}
            setTableSidePanelActive={setTableSidePanelActive}
            setExternalRerender={setExternalRerender}
            sidePanelPosition={sidePanelPosition}
            setSidePanelPosition={setSidePanelPosition}
            currentSettingsActive={currentSettingsActive}
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
                {activePanel.current === "general" && (
                  <GeneralPanel tablePanelRef={tablePanelRef} />
                )}
                {activePanel.current === "upload" && (
                  <UploadingPanel
                    tablePanelRef={tablePanelRef}
                    setExternalRerender={setRerender}
                  />
                )}
                {activePanel.current === "download" && (
                  <DownloadingPanel
                    tablePanelRef={tablePanelRef}
                    setExternalRerender={setRerender}
                  />
                )}
                {activePanel.current === "settings" && (
                  <SettingsPanel
                    currentSettingsActive={currentSettingsActive}
                  />
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
