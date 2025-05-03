import React, { useEffect, useRef, useState } from "react";
import CaptureMediaController from "../CaptureMediaController";

export default function VideoDurationSection({
  videoRef,
  captureMediaController,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  captureMediaController: React.MutableRefObject<CaptureMediaController>;
}) {
  const [fontSize, setFontSize] = useState("16px");
  const [paddingTop, setPaddingTop] = useState("2px");
  const [currentTime, setCurrentTime] = useState(1);

  const counterRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (time < 60) {
      return `${seconds}`;
    }

    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);

    captureMediaController.current.timeUpdate();
  };

  useEffect(() => {
    const updateFontSize = () => {
      if (counterRef.current) {
        const height = counterRef.current.clientHeight;
        setFontSize(`${height * 0.6}px`);
        setPaddingTop(`${height * 0.1}px`);
      }
    };

    const observer = new ResizeObserver(updateFontSize);
    if (counterRef.current) observer.observe(counterRef.current);

    return () => {
      observer.disconnect();
    };
  }, [counterRef.current]);

  useEffect(() => {
    videoRef.current?.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return videoRef.current ? (
    <div
      ref={counterRef}
      className="z-20 flex h-full w-max select-none items-center justify-center whitespace-nowrap font-Josefin text-fg-white"
      style={{ fontSize, lineHeight: "0.8lh", paddingTop }}
    >
      {formatTime(currentTime)} /{" "}
      {isFinite(videoRef.current.duration)
        ? formatTime(videoRef.current.duration)
        : "0:00:00"}
    </div>
  ) : null;
}
