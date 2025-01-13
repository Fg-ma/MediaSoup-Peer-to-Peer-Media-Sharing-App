import React from "react";
import { TableColors } from "../../lib/TableSocketController";
import UserBubble from "./UserBubble";
import { tableColorMap } from "../FgTable";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const alien_960x960 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_960x960.jpg";
const alien_64x64 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_64x64.jpg";

export default function TopTableSection({
  userData,
}: {
  userData: {
    [username: string]: {
      color: TableColors;
      seat: number;
      online: boolean;
    };
  };
}) {
  const topSeats = [1, 2, 3, 4];
  const topUsers = Object.entries(userData).filter((data) =>
    topSeats.includes(data[1].seat)
  );

  return (
    <div
      className={`w-full h-max max-h-[8%] flex items-center mb-[1%] ${
        topUsers.length > 1 ? "justify-between" : "justify-center"
      }`}
    >
      {topUsers.map((user) => (
        <UserBubble
          src={alien_960x960}
          srcLoading={alien_64x64}
          primaryColor={tableColorMap[user[1].color].primary}
          secondaryColor={tableColorMap[user[1].color].secondary}
        />
      ))}
    </div>
  );
}
