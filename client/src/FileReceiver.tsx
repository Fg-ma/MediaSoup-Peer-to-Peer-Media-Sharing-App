import React, { useEffect, useRef, useState } from "react";
import shaka from "shaka-player";
import { useSocketContext } from "./context/socketContext/SocketContext";
import { IncomingTableStaticContentMessages } from "./lib/TableStaticContentSocketController";

export default function FileReceiver() {
  const { tableStaticContentSocket } = useSocketContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const shakaPlayer = useRef<shaka.Player | null>(null);
  const [showHiddenVideo, setShowHiddenVideo] = useState(false);
  const [hiddenVideoOpacity, setHiddenVideoOpacity] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      shakaPlayer.current = new shaka.Player(videoRef.current);
    }
  }, []);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(handleMessage);

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(handleMessage);
  }, [tableStaticContentSocket.current]);

  const preloadDashStream = (dashUrl: string) => {
    if (hiddenVideoRef.current) {
      const hiddenPlayer = new shaka.Player(hiddenVideoRef.current);
      hiddenPlayer.load(dashUrl).then(() => {
        switchToDashStream(dashUrl);
      });
    }
  };

  const switchToDashStream = async (dashUrl: string) => {
    if (!videoRef.current || !hiddenVideoRef.current) return;
    console.log("DASH stream swap");

    try {
      const currentTime = videoRef.current.currentTime;
      const isPaused = videoRef.current.paused;

      // Sync hidden video with the main video
      hiddenVideoRef.current.currentTime = currentTime;
      if (!isPaused) {
        hiddenVideoRef.current.play();
      }

      const videoBox = videoRef.current.getBoundingClientRect();

      hiddenVideoRef.current.width = videoBox.width;
      hiddenVideoRef.current.height = videoBox.height;

      setShowHiddenVideo(true);

      setTimeout(() => {
        setHiddenVideoOpacity(true);
      }, 500);

      // After a short delay, switch the main video to DASH and hide the hidden video
      setTimeout(async () => {
        if (!videoRef.current || !hiddenVideoRef.current) return;

        await shakaPlayer.current?.load(dashUrl, currentTime);

        videoRef.current.width = videoBox.width;
        videoRef.current.height = videoBox.height;

        videoRef.current.currentTime = hiddenVideoRef.current.currentTime;
        if (!hiddenVideoRef.current.paused) {
          videoRef.current.play();
        }

        // Hide the hidden video and clean up
        setTimeout(() => {
          setShowHiddenVideo(false);
          setHiddenVideoOpacity(false);
          if (hiddenVideoRef.current) hiddenVideoRef.current.src = "";
        }, 250);
      }, 1000); // Adjust the delay if needed
    } catch (error) {
      console.error("Error during DASH switch:", error);
    }
  };

  const handleMessage = (message: IncomingTableStaticContentMessages) => {
    switch (message.type) {
      case "originalVideoReady":
        shakaPlayer.current?.load(message.data.url).then(() => {
          console.log("Original video loaded successfully");
        });
        break;
      case "dashVideoReady":
        preloadDashStream(message.data.url);
        break;
      // case "truncatedVideoReady":
      //   shakaPlayer.current?.load(message.url).then(() => {
      //     console.log("Original video loaded successfully");
      //   });
      //   break;
      default:
        break;
    }
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: "10%",
      }}
    >
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{
          width: "100%",
          objectFit: "cover",
          backgroundColor: "#000",
        }}
      />
      <video
        ref={hiddenVideoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          objectFit: "cover",
          display: showHiddenVideo ? "" : "none",
          opacity: hiddenVideoOpacity ? "100%" : "0%",
          backgroundColor: "#000",
          zIndex: 10,
        }}
      />
    </div>
  );
}
