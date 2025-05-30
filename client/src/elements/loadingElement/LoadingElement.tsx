import React from "react";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import AtomLoader from "../loaders/atomLoader/AtomLoader";
import BouncingLoader from "../loaders/bouncingLoader/BouncingLoader";

export default function LoadingElement({
  className,
  pauseDownload,
  aspectRatio,
}: {
  className?: string;
  pauseDownload?: () => void;
  aspectRatio?: React.MutableRefObject<number | undefined>;
}) {
  const { preferences } = useUserInfoContext();

  return (
    <>
      {preferences.current.loadingAnimation === "bounce" && (
        <BouncingLoader className={className} onClick={pauseDownload} />
      )}
      {preferences.current.loadingAnimation === "atom" && (
        <div
          className={`${className} flex items-center justify-center`}
          onClick={pauseDownload}
        >
          <AtomLoader
            className={`${(aspectRatio?.current ?? 0) > 1 ? "!aspect-square h-full" : "!aspect-square w-full"} relative`}
          />
        </div>
      )}
    </>
  );
}
