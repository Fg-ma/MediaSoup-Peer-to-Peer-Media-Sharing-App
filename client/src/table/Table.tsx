import React, { useEffect, useRef, useState } from "react";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import FgTableController from "./lib/FgTableController";
import FgScrollbarElement from "../elements/fgScrollbarElement/FgScrollbarElement";
import TableGridOverlay from "./lib/TableGridOverlay";
import UploadTableLayer from "../tableLayers/uploadTableLayer/UploadTableLayer";
import NewInstancesLayer from "../tableLayers/newInstancesLayer/NewInstancesLayer";
import SelectTableLayer from "../tableLayers/selectTableLayer/SelectTableLayer";
import SharedBundle from "../sharedBundle/SharedBundle";
import UserDevice from "../lib/UserDevice";
import Deadbanding from "../babylon/Deadbanding";
import LeftTableSection from "./lib/sideSections/LeftTableSection";
import RightTableSection from "./lib/sideSections/RightTableSection";
import TopTableSection from "./lib/sideSections/TopTableSection";
import BottomTableSection from "./lib/sideSections/BottomTableSection";
import { TableColors } from "../serverControllers/tableServer/lib/typeConstant";
import "./lib/fgTable.css";
import TableInfoPopup from "./lib/tableInfoPopup/TableInfoPopup";
import LoadingTab from "./lib/loadingTab/LoadingTab";
import TableSidePanel, { TablePanels } from "../tableSidePanel/TableSidePanel";

export default function Table({
  tableRef,
  tableTopRef,
  bundles,
  gridActive,
  gridSize,
  userDevice,
  deadbanding,
}: {
  tableRef: React.RefObject<HTMLDivElement>;
  tableTopRef: React.RefObject<HTMLDivElement>;
  bundles: {
    [username: string]: {
      [instance: string]: React.JSX.Element;
    };
  };
  gridActive: boolean;
  gridSize: {
    rows: number;
    cols: number;
  };
  userDevice: React.MutableRefObject<UserDevice>;
  deadbanding: React.MutableRefObject<Deadbanding>;
}) {
  const { tableSocket } = useSocketContext();
  const { username, instance } = useUserInfoContext();

  const [userData, setUserData] = useState<{
    [username: string]: { color: TableColors; seat: number; online: boolean };
  }>({});
  const [activePanel, setActivePanel] = useState<TablePanels | undefined>(
    "loading",
  );
  const [_, setRerender] = useState(false);
  const aspectDir = useRef<"width" | "height">("width");
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const innerTableContainerRef = useRef<HTMLDivElement>(null);

  const fgTableController = useRef(
    new FgTableController(
      username,
      instance,
      tableRef,
      setUserData,
      aspectDir,
      setRerender,
    ),
  );

  useEffect(() => {
    fgTableController.current.getAspectDir();

    setTimeout(() => {
      if (tableRef.current) {
        if (aspectDir.current === "width") {
          tableRef.current.scrollTo({
            top:
              (tableRef.current.scrollHeight - tableRef.current.clientHeight) /
              2,
            behavior: "instant",
          });
        } else {
          tableRef.current.scrollTo({
            left:
              (tableRef.current.scrollWidth - tableRef.current.clientWidth) / 2,
            behavior: "instant",
          });
        }
      }
    }, 100);

    window.addEventListener("resize", fgTableController.current.getAspectDir);

    return () => {
      window.removeEventListener(
        "resize",
        fgTableController.current.getAspectDir,
      );
    };
  }, []);

  useEffect(() => {
    tableSocket.current?.addMessageListener(
      fgTableController.current.handleTableMessage,
    );

    return () => {
      tableSocket.current?.removeMessageListener(
        fgTableController.current.handleTableMessage,
      );
    };
  }, [tableSocket.current]);

  return (
    <div className="flex w-full grow items-center justify-center">
      <TableSidePanel activePanel={activePanel} />
      <div ref={tableContainerRef} className="flex h-full grow flex-col">
        <TopTableSection
          userData={userData}
          tableContainerRef={tableContainerRef}
        />
        <div
          ref={innerTableContainerRef}
          className="flex w-full"
          style={{ height: "1px", flexGrow: "1" }}
        >
          <LeftTableSection
            userData={userData}
            tableContainerRef={tableContainerRef}
          />
          <FgScrollbarElement
            direction={
              aspectDir.current === "width" ? "vertical" : "horizontal"
            }
            scrollingContentRef={tableRef}
            content={
              <>
                <TableInfoPopup />
                <LoadingTab />
                <div
                  ref={tableRef}
                  className={`fg-table relative h-full w-full rounded-md border-2 border-fg-off-white ${
                    aspectDir.current === "width"
                      ? "overflow-y-auto"
                      : "overflow-x-auto"
                  }`}
                >
                  <div
                    ref={tableTopRef}
                    className="relative aspect-square overflow-hidden bg-fg-tone-black-6"
                    style={{
                      ...(aspectDir.current === "width"
                        ? { width: "100%" }
                        : { height: "100%" }),
                    }}
                  >
                    <SelectTableLayer
                      innerTableContainerRef={innerTableContainerRef}
                      tableRef={tableRef}
                      tableTopRef={tableTopRef}
                    />
                    <UploadTableLayer />
                    <NewInstancesLayer tableRef={tableRef} />
                    {gridActive && (
                      <TableGridOverlay
                        gridSize={gridSize}
                        tableTopRef={tableTopRef}
                        gridColor="#fff"
                      />
                    )}
                    <SharedBundle
                      userDevice={userDevice}
                      deadbanding={deadbanding}
                      tableRef={tableRef}
                    />
                    {bundles &&
                      Object.keys(bundles).length !== 0 &&
                      Object.keys(bundles).map(
                        (username) =>
                          Object.keys(bundles[username]).length !== 0 &&
                          Object.entries(bundles[username]).map(
                            ([key, bundle]) => (
                              <div
                                className="pointer-events-none absolute left-0 top-0 h-full w-full"
                                key={key}
                                id={`${key}_bundle`}
                              >
                                {bundle}
                              </div>
                            ),
                          ),
                      )}
                  </div>
                </div>
              </>
            }
            style={{
              width: "100%",
              flexGrow: "1",
            }}
          />
          <RightTableSection
            userData={userData}
            tableContainerRef={tableContainerRef}
          />
        </div>
        <BottomTableSection
          userData={userData}
          tableContainerRef={tableContainerRef}
        />
      </div>
    </div>
  );
}
