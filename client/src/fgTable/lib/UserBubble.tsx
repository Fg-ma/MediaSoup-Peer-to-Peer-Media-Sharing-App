import React, { useEffect, useRef, useState } from "react";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgImage from "../../elements/fgImageElement/FgImageElement";
import FgButton from "../../elements/fgButton/FgButton";
import FgPanel from "../../elements/fgPanel/FgPanel";
import FriendStatusButton from "./tableUserFunctions/FriendStatusButton";
import PrivateMessageButton from "./tableUserFunctions/PrivateMessageButton";
import PingButton from "./tableUserFunctions/PingButton";
import OpenKidsTableButton from "./tableUserFunctions/OpenKidsTableButton";
import KickFromTableButton from "./tableUserFunctions/KickFromTableButton";
import SilenceButton from "./tableUserFunctions/SilenceButton";
import HideContentFromButton from "./tableUserFunctions/HideContentFromButton";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import { TableColors } from "../../serverControllers/tableServer/lib/typeConstant";
import SwapSeatsbutton from "./tableUserFunctions/SwapSeatsButton";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBack = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";
const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function UserBubble({
  username,
  userData,
  fullDim,
  placement,
  src,
  srcLoading,
  primaryColor,
  secondaryColor,
}: {
  username: string;
  userData: {
    [username: string]: {
      color: TableColors;
      seat: number;
      online: boolean;
    };
  };
  fullDim: "width" | "height";
  placement: "top" | "bottom" | "left" | "right";
  src: string;
  srcLoading: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  const { tableSocket } = useSocketContext();

  const [hovering, setHovering] = useState(false);
  const [moreUserInformationActive, setMoreUserInformationActive] =
    useState(false);
  const userBubbleButtonRef = useRef<HTMLButtonElement>(null);
  const userPanelRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (event: PointerEvent) => {
    if (
      !userPanelRef.current?.contains(event.target as Node) &&
      !userBubbleButtonRef.current?.contains(event.target as Node)
    ) {
      setMoreUserInformationActive(false);
    }
  };

  useEffect(() => {
    if (moreUserInformationActive) {
      document.addEventListener("pointerdown", handlePointerDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
      };
    }
  }, [moreUserInformationActive]);

  return (
    <div
      className={`relative aspect-square ${
        fullDim === "height" ? "h-full" : "w-full"
      }`}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <FgButton
        externalRef={userBubbleButtonRef}
        className='h-full w-full rounded-full border-2 overflow-hidden'
        style={{
          borderColor: primaryColor,
          boxShadow: `0px 4px 8px ${secondaryColor}`,
        }}
        contentFunction={() => <FgImage src={src} srcLoading={srcLoading} />}
        clickFunction={() => setMoreUserInformationActive((prev) => !prev)}
      />
      {hovering && Object.keys(userData).length > 1 && (
        <>
          <FgButton
            className={`absolute w-1/2 aspect-square flex justify-start items-center ${
              placement === "top"
                ? "bottom-1/2 translate-y-1/2 right-full pr-2"
                : placement === "bottom"
                ? "top-1/2 -translate-y-1/2 right-full pr-2"
                : placement === "right"
                ? "left-1/2 -translate-x-1/2 top-full -rotate-90 pr-2"
                : placement === "left"
                ? "right-1/2 translate-x-1/2 top-full -rotate-90 pr-2"
                : ""
            }`}
            clickFunction={() =>
              tableSocket.current?.moveSeats(
                placement === "top" || placement === "left" ? "left" : "right",
                username
              )
            }
            contentFunction={() => (
              <FgSVGElement
                src={navigateBack}
                style={{ width: "100%", aspectRatio: "1 / 1" }}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
          />
          <FgButton
            className={`absolute w-1/2 aspect-square flex justify-start items-center ${
              placement === "top"
                ? "bottom-1/2 translate-y-1/2 left-full pl-2"
                : placement === "bottom"
                ? "top-1/2 -translate-y-1/2 left-full pl-2"
                : placement === "right"
                ? "left-1/2 -translate-x-1/2 bottom-full -rotate-90 pl-2"
                : placement === "left"
                ? "right-1/2 translate-x-1/2 bottom-full -rotate-90 pl-2"
                : ""
            }`}
            clickFunction={() =>
              tableSocket.current?.moveSeats(
                placement === "top" || placement === "left" ? "right" : "left",
                username
              )
            }
            contentFunction={() => (
              <FgSVGElement
                src={navigateForward}
                style={{ width: "100%", aspectRatio: "1 / 1" }}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
          />
        </>
      )}
      {moreUserInformationActive && (
        <FgPanel
          content={
            <div
              ref={userPanelRef}
              className='flex small-vertical-scroll-bar w-full h-full overflow-y-auto py-2 flex-col space-y-2'
            >
              <div className='flex items-center justify-center h-max w-full space-x-2'>
                <div
                  className='w-1/5 h-full rounded-lg border-2 overflow-hidden'
                  style={{
                    borderColor: primaryColor,
                  }}
                >
                  <FgImage src={src} srcLoading={srcLoading} />
                </div>
                <div className='grow h-max text-fg-tone-black-2 font-K2D truncate text-xl'>
                  {username}
                </div>
              </div>
              <div className='grid grid-cols-3 w-full h-max gap-3'>
                <SwapSeatsbutton
                  username={username}
                  userPanelRef={userPanelRef}
                />
                <FriendStatusButton userPanelRef={userPanelRef} />
                <PrivateMessageButton userPanelRef={userPanelRef} />
                <PingButton userPanelRef={userPanelRef} />
                <OpenKidsTableButton userPanelRef={userPanelRef} />
                <KickFromTableButton
                  username={username}
                  userPanelRef={userPanelRef}
                />
                <SilenceButton userPanelRef={userPanelRef} />
                <HideContentFromButton userPanelRef={userPanelRef} />
              </div>
            </div>
          }
          initPosition={{
            referenceElement: userBubbleButtonRef.current ?? undefined,
            placement: "above",
            padding: 4,
          }}
          initWidth={"300px"}
          initHeight={"230px"}
          minWidth={200}
          minHeight={80}
          closeCallback={() => setMoreUserInformationActive(false)}
          closePosition='topRight'
          shadow={{ top: true, bottom: true }}
        />
      )}
    </div>
  );
}
