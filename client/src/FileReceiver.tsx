import React, { useEffect, useRef, useState } from "react";
import shaka from "shaka-player";

export default function FileReceiver() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const shakaPlayer = useRef<shaka.Player | null>(null);
  const [showHiddenVideo, setShowHiddenVideo] = useState(false);
  const mediaSource = useRef<MediaSource | undefined>(undefined);

  useEffect(() => {
    if (videoRef.current) {
      shakaPlayer.current = new shaka.Player(videoRef.current);
    }

    const ws = new WebSocket("wss://localhost:8045");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "originalVideoReady") {
        const { url } = message;
        // shakaPlayer.current
        //   ?.load(url)
        //   .then(() => {
        //     console.log("Original video loaded successfully");
        //   })
        //   .catch(onErrorEvent);
      }

      if (message.type === "truncatedVideoReady") {
        const { url } = message;
        console.log(url, shakaPlayer.current);
        shakaPlayer.current
          ?.load(url)
          .then(() => {
            console.log("Original video loaded successfully");
          })
          .catch(onErrorEvent);
      }

      if (message.type === "dashVideoReady") {
        const { url } = message;
        // preloadDashStream(url);
      }
    };

    return () => ws.close();
  }, []);

  const preloadDashStream = (dashUrl: string) => {
    if (hiddenVideoRef.current) {
      const hiddenPlayer = new shaka.Player(hiddenVideoRef.current);
      hiddenPlayer
        .load(dashUrl)
        .then(() => {
          switchToDashStream(dashUrl);
        })
        .catch(onErrorEvent);
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
        // hiddenVideoRef.current.play();
      }

      // Match the size and position of the main video
      applyHiddenVideoStyles();

      // Crossfade hidden video in and main video out
      setShowHiddenVideo(true);

      // After a short delay, switch the main video to DASH and hide the hidden video
      setTimeout(async () => {
        if (!videoRef.current || !hiddenVideoRef.current) return;
        await shakaPlayer.current.load(dashUrl, currentTime);
        videoRef.current.currentTime = currentTime;
        if (!isPaused) {
          // videoRef.current.play();
        }

        // Hide the hidden video and clean up
        setShowHiddenVideo(false);
        hiddenVideoRef.current.src = "";
      }, 500); // Adjust the delay if needed
    } catch (error) {
      console.error("Error during DASH switch:", error);
    }
  };

  // Dynamically apply styles to the hidden video to match the main video
  const applyHiddenVideoStyles = () => {
    if (!videoRef.current || !hiddenVideoRef.current) return;

    const mainVideoRect = videoRef.current.getBoundingClientRect();
    const hiddenVideo = hiddenVideoRef.current;

    hiddenVideo.style.position = "absolute";
    hiddenVideo.style.width = `${mainVideoRect.width}px`;
    hiddenVideo.style.height = `${mainVideoRect.height}px`;
    hiddenVideo.style.zIndex = "10";
    hiddenVideo.style.objectFit = "cover";
  };

  const onErrorEvent = (event: any) => {
    console.error("Error:", event);
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxHeight: "500px",
      }}
    >
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{
          width: "100%",
          objectFit: "cover",
          maxHeight: "500px",
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
          pointerEvents: "none",
          backgroundColor: "#000",
        }}
      />
    </div>
  );
}
