import React from "react";
import { TableColors } from "../../serverControllers/tableServer/TableSocketController";
import UserBubble from "./UserBubble";
import { tableColorMap } from "./tableColors";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const alien_960x960 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_960x960.jpg";
const alien_64x64 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_64x64.jpg";

export default function BottomTableSection({
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
  const bottomSeats = [9, 10, 11, 12];
  const bottomUsers = Object.entries(userData).filter((data) =>
    bottomSeats.includes(data[1].seat)
  );

  return (
    <div
      className={`w-full h-max flex items-center ${
        bottomUsers.length > 1 ? "justify-between" : "justify-center"
      }`}
      style={{
        maxHeight: `${minDimension * 0.08}px`,
        ...(Object.keys(userData).length >= 4 && {
          paddingLeft: `${minDimension * 0.08}px`,
          paddingRight: `${minDimension * 0.08}px`,
        }),
        ...(bottomUsers.length !== 0 && {
          marginTop: `${minDimension * 0.01}px`,
        }),
      }}
    >
      <div></div>
      {bottomUsers.map((user) => (
        <UserBubble
          key={user[0]}
          username={user[0]}
          userData={userData}
          fullDim='height'
          placement='bottom'
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
