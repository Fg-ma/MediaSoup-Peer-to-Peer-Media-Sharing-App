import { EffectTypes } from "src/context/StreamsContext";
import applyBoxBlur from "./lib/applyBoxBlur";
import applyTint from "./lib/applyTint";
import setStopFunction from "./lib/setStopFunction";

function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

const EffectSectionCPU = async (
  type: "webcam" | "screen" | "audio",
  id: string,
  userUneffectedStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userStopStreamEffects: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>,
  tintColor: React.MutableRefObject<string>,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  }
) => {
  // Create a video element to play the track
  const video = document.createElement("video");
  video.srcObject = new MediaStream([
    type === "webcam" || type === "screen"
      ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
      : userUneffectedStreams.current[type]!.getVideoTracks()[0],
  ]);
  video.play();

  // Create a canvas to draw the video frames
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    return new Error("No canvas rendering context");
  }

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth / 2;
    canvas.height = video.videoHeight / 2;
  };

  let isRunning = true;
  const frameRate = 60;
  const intervalId = setInterval(() => {
    if (!isRunning) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (effects.blur) {
      applyBoxBlur(ctx, canvas);
    }
    if (effects.tint) {
      applyTint(ctx, canvas, hexToRgb(tintColor.current));
    }
  }, 1000 / frameRate);

  setStopFunction(
    isRunning,
    intervalId,
    video,
    ctx,
    canvas,
    type,
    id,
    userStopStreamEffects
  );

  return canvas.captureStream().getVideoTracks()[0];
};

export default EffectSectionCPU;
