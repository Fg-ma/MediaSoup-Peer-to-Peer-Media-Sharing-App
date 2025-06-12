import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import TableVideoMediaInstance from "src/media/fgTableVideo/TableVideoMediaInstance";

export const videoSpeedSelections = [
  "0.25",
  "0.5",
  "0.75",
  "1",
  "2",
  "2.5",
  "3",
];

export default function VideoSpeedPage({
  videoMediaInstance,
  setRerender,
}: {
  videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const setVideoSpeed = (videoSpeed: number) => {
    videoMediaInstance.current.meta.videoSpeed = videoSpeed;

    if (videoMediaInstance.current.instanceVideo)
      videoMediaInstance.current.instanceVideo.playbackRate = videoSpeed;

    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 1rem)" }}
      ></div>
      {Object.entries(videoSpeedSelections)
        .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
        .map(([key, speed]) => (
          <FgButton
            key={key}
            className={`flex items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
              parseFloat(speed) === videoMediaInstance.current.meta.videoSpeed
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
            style={{ width: "calc(100% - 1rem)" }}
            contentFunction={() => (
              <div className="flex w-full items-start px-2">{speed}</div>
            )}
            clickFunction={() => {
              setVideoSpeed(parseFloat(speed));
            }}
          />
        ))}
    </>
  );
}
