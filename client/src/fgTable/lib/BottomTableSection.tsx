import React from "react";
import { TableColors } from "../../lib/TableSocketController";
import FgImage from "../../fgElements/fgImageElement/FgImageElement";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const alien_960x960 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_960x960.jpg";
const alien_64x64 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/alien_64x64.jpg";

export default function BottomTableSection({
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
  const bottomSeats = [9, 10, 11, 12];
  const bottomUsers = Object.entries(userData).filter((data) =>
    bottomSeats.includes(data[1].seat)
  );

  return (
    <div
      className={`w-full h-max max-h-[8%] flex items-center ${
        bottomUsers.length > 1 ? "justify-between" : "justify-center"
      }`}
    >
      {bottomUsers.map(() => (
        <div className='h-full aspect-square rounded-full border-2 border-red-500 overflow-hidden'>
          <FgImage src={alien_960x960} srcLoading={alien_64x64} />
        </div>
      ))}
    </div>
  );
}
