import React, { useEffect, useRef, useState } from "react";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
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

export const tableColorMap: {
  [tableColor in TableColors]: { primary: string; secondary: string };
} = {
  cyan: { primary: "#1a8ca2", secondary: "#336b7b" },
  orange: { primary: "#f78528", secondary: "#ef6900" },
  blue: { primary: "#1d69ca", secondary: "#1a1f6b" },
  green: { primary: "#00763a", secondary: "#123324" },
  yellow: { primary: "#e0c240", secondary: "#f7b705" },
  purple: { primary: "#d4afdc", secondary: "#987fdd" },
  pink: { primary: "#f77cf7", secondary: "#ed75d0" },
  black: { primary: "#221d1e", secondary: "#0c0001" },
  white: { primary: "#f6eded", secondary: "#e0d8d8" },
  brown: { primary: "#5c423b", secondary: "#372b27" },
  lime: { primary: "#bad95f", secondary: "#a0c15c" },
  coral: { primary: "#f28a85", secondary: "#f7423b" },
  gray: { primary: "#6a5d5e", secondary: "#483f40" },
  navy: { primary: "#252c48", secondary: "#313246" },
  lightBlue: { primary: "#88c3e7", secondary: "#61b4dd" },
  tableTop: { primary: "#d40213", secondary: "#b10203" },
};

export default function FgTable({
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
  userDevice: UserDevice;
  deadbanding: Deadbanding;
}) {
  const { tableSocket } = useSocketContext();
  const { username, instance } = useUserInfoContext();

  const [userData, setUserData] = useState<{
    [username: string]: { color: TableColors; seat: number; online: boolean };
  }>({});
  const [_rerender, setRerender] = useState(false);
  const aspectDir = useRef<"width" | "height">("width");
  const tableContainerRef = useRef<HTMLDivElement>(null);

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
    <div ref={tableContainerRef} className='grow h-1 w-full flex flex-col'>
      <TopTableSection
        userData={userData}
        tableContainerRef={tableContainerRef}
      />
      <div className='w-full flex' style={{ height: "1px", flexGrow: "1" }}>
        <LeftTableSection
          userData={userData}
          tableContainerRef={tableContainerRef}
        />
        <FgScrollbarElement
          direction={aspectDir.current === "width" ? "vertical" : "horizontal"}
          scrollingContentRef={tableRef}
          content={
            <div
              ref={tableRef}
              className={`fg-table relative rounded-md w-full h-full border-[3px] border-fg-off-white ${
                aspectDir.current === "width"
                  ? "overflow-y-auto"
                  : "overflow-x-auto"
              }`}
            >
              <div
                ref={tableTopRef}
                className='relative bg-fg-tone-black-6 aspect-square overflow-hidden'
                style={{
                  ...(aspectDir.current === "width"
                    ? { width: "100%" }
                    : { height: "100%" }),
                }}
              >
                <UploadTableLayer />
                {gridActive && (
                  <TableGridOverlay
                    gridSize={gridSize}
                    tableTopRef={tableTopRef}
                    gridColor='#fff'
                  />
                )}
                <SharedBundle
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
  );
}
