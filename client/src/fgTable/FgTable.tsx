import React, { useEffect, useRef, useState } from "react";
import { useSocketContext } from "../context/socketContext/SocketContext";
import FgTableController from "./lib/FgTableController";
import FgScrollbarElement from "../fgElements/fgScrollbarElement/FgScrollbarElement";
import TableGridOverlay from "./lib/TableGridOverlay";
import UploadTableLayer from "../uploadTableLayer/UploadTableLayer";
import SharedBundle from "../sharedBundle/SharedBundle";
import UserDevice from "../lib/UserDevice";
import Deadbanding from "../babylon/Deadbanding";
import LeftTableSection from "./lib/LeftTableSection";
import RightTableSection from "./lib/RightTableSection";
import TopTableSection from "./lib/TopTableSection";
import BottomTableSection from "./lib/BottomTableSection";
import { TableColors } from "../lib/TableSocketController";
import "./lib/fgTable.css";

export default function FgTable({
  table_id,
  username,
  instance,
  tableRef,
  tableTopRef,
  bundles,
  gridActive,
  gridSize,
  userDevice,
  deadbanding,
}: {
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
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
  userDevice: UserDevice;
  deadbanding: Deadbanding;
}) {
  const { tableSocket } = useSocketContext();

  const [userData, setUserData] = useState<{
    [username: string]: { color: TableColors; seat: number; online: boolean };
  }>({});
  const [_rerender, setRerender] = useState(false);
  const aspectDir = useRef<"width" | "height">("width");

  const fgTableController = new FgTableController(
    username,
    instance,
    tableRef,
    setUserData,
    aspectDir,
    setRerender
  );

  useEffect(() => {
    fgTableController.getAspectDir();

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

    window.addEventListener("resize", fgTableController.getAspectDir);

    return () => {
      window.removeEventListener("resize", fgTableController.getAspectDir);
    };
  }, []);

  useEffect(() => {
    tableSocket.current?.addMessageListener(
      fgTableController.handleTableMessage
    );

    return () => {
      tableSocket.current?.removeMessageListener(
        fgTableController.handleTableMessage
      );
    };
  }, [tableSocket.current]);

  return (
    <div
      className='w-full flex flex-col'
      style={{
        height: "calc(100% - 8rem)",
      }}
    >
      <TopTableSection userData={userData} />
      <div className='w-full flex' style={{ height: "40rem" }}>
        <LeftTableSection userData={userData} />
        <FgScrollbarElement
          direction={aspectDir.current === "width" ? "vertical" : "horizontal"}
          scrollingContentRef={tableRef}
          content={
            <div
              ref={tableRef}
              className={`fg-table relative rounded-md w-full h-full ${
                aspectDir.current === "width"
                  ? "overflow-y-auto"
                  : "overflow-x-auto"
              }`}
            >
              <div
                ref={tableTopRef}
                className='relative bg-fg-white-65 aspect-square overflow-hidden'
                style={{
                  ...(aspectDir.current === "width"
                    ? { width: "100%" }
                    : { height: "100%" }),
                }}
              >
                <UploadTableLayer table_id={table_id} />
                {gridActive && (
                  <TableGridOverlay
                    gridSize={gridSize}
                    tableTopRef={tableTopRef}
                    gridColor='#fff'
                  />
                )}
                <SharedBundle
                  table_id={table_id.current}
                  username={username.current}
                  instance={instance.current}
                  userDevice={userDevice}
                  deadbanding={deadbanding}
                />
                {bundles &&
                  Object.keys(bundles).length !== 0 &&
                  Object.keys(bundles).map(
                    (username) =>
                      Object.keys(bundles[username]).length !== 0 &&
                      Object.entries(bundles[username]).map(([key, bundle]) => (
                        <div
                          className='w-full h-full absolute top-0 left-0 pointer-events-none'
                          key={key}
                          id={`${key}_bundle`}
                        >
                          {bundle}
                        </div>
                      ))
                  )}
              </div>
            </div>
          }
          style={{
            width: "100%",
            flexGrow: "1",
          }}
        />
        <RightTableSection userData={userData} />
      </div>
      <BottomTableSection userData={userData} />
    </div>
  );
}
