import React, { useEffect, useRef, useState } from "react";

export default function FileReceiver() {
  const chunks = useRef<Uint8Array[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket("wss://localhost:8045");

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        const message = JSON.parse(event.data);
        if (message.type === "fileStart") {
          chunks.current = [];
        } else if (message.type === "fileEnd") {
          createBlobUrl();
        }
      } else {
        const data = new Uint8Array(event.data);

        chunks.current = [...chunks.current, data];
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const createBlobUrl = () => {
    if (chunks.current.length > 0) {
      const blob = new Blob(chunks.current, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      console.log(url);
      setBlobUrl(url);

      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

  const downloadVideo = () => {
    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "downloaded-video.mp4";
      link.click();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Video Stream Receiver</h1>
      <video
        ref={videoRef}
        controls
        style={{ width: "100%", maxHeight: "500px" }}
      />
      <button
        onClick={downloadVideo}
        disabled={!blobUrl}
        style={{ marginTop: "10px" }}
      >
        Download Video
      </button>
    </div>
  );
}
