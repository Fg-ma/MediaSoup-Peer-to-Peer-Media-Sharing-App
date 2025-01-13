import React from "react";
import { TableColors } from "../../lib/TableSocketController";
import FgImage from "../../fgElements/fgImageElement/FgImageElement";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const alien_960x960 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_960x960.jpg";
const alien_64x64 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_64x64.jpg";

export default function LeftTableSection({
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
  const leftSeats = [13, 14, 15, 16];
  const leftUsers = Object.entries(userData).filter((data) =>
    leftSeats.includes(data[1].seat)
  );

  return (
    <div
      className={`w-max max-w-[8%] h-full flex flex-col items-center ${
        leftUsers.length > 1 ? "justify-between" : "justify-center"
      }`}
    >
      {leftUsers.map(() => (
        <div className='w-full aspect-square rounded-full border-2 border-red-500 overflow-hidden'>
          <FgImage src={alien_960x960} srcLoading={alien_64x64} />
        </div>
      ))}
    </div>
  );
}
