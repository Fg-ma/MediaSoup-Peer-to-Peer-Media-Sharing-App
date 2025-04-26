import React from "react";
import { TableColors } from "../../../serverControllers/tableServer/lib/typeConstant";
import UserBubble from "../UserBubble";
import { tableColorMap } from "../tableColors";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const alien_960x960 =
  nginxAssetServerBaseUrl + "backgroundImages/space/alien_960x960.jpg";
const alien_64x64 =
  nginxAssetServerBaseUrl + "backgroundImages/space/alien_64x64.jpg";

export default function RightTableSection({
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
    tableContainerRef.current?.clientHeight ?? 0,
  );
  const rightSeats = [5, 6, 7, 8];
  const rightUsers = Object.entries(userData).filter((data) =>
    rightSeats.includes(data[1].seat),
  );

  return (
    <div
      className={`max-w flex h-full max-w-[8%] flex-col items-center ${
        rightUsers.length > 1 ? "justify-between" : "justify-center"
      }`}
      style={{
        maxWidth: `${minDimension * 0.08}px`,
        ...(rightUsers.length !== 0 && {
          marginLeft: `${minDimension * 0.01}px`,
        }),
      }}
    >
      <div></div>
      {rightUsers.map((user) => (
        <UserBubble
          key={user[0]}
          username={user[0]}
          userData={userData}
          fullDim="width"
          placement="right"
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
