import React from "react";
import { TableColors } from "../../lib/TableSocketController";
import UserBubble from "./UserBubble";
import { tableColorMap } from "../FgTable";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const alien_960x960 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_960x960.jpg";
const alien_64x64 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_64x64.jpg";

export default function LeftTableSection({
  userData,
  tableContainerRef,
}: {
  userData: {
    [username: string]: {
      color: TableColors;
      seat: number;
      online: boolean;
    };
  };
  tableContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const minDimension = Math.min(
    tableContainerRef.current?.clientWidth ?? 0,
    tableContainerRef.current?.clientHeight ?? 0
  );
  const leftSeats = [13, 14, 15, 16];
  const leftUsers = Object.entries(userData).filter((data) =>
    leftSeats.includes(data[1].seat)
  );

  return (
    <div
      className={`w-max max-w-[8%] h-full flex flex-col items-center ${
        leftUsers.length > 1 ? "justify-between" : "justify-center"
      }`}
      style={{
        maxWidth: `${minDimension * 0.08}px`,
        ...(leftUsers.length !== 0 && {
          marginRight: `${minDimension * 0.01}px`,
        }),
      }}
    >
      <div></div>
      {leftUsers.map((user) => (
        <UserBubble
          fullDim='width'
          src={alien_960x960}
          srcLoading={alien_64x64}
          primaryColor={tableColorMap[user[1].color].primary}
          secondaryColor={tableColorMap[user[1].color].secondary}
        />
      ))}
      <div></div>
    </div>
  );
}
