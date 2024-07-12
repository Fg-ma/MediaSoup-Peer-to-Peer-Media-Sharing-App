import * as faceapi from "face-api.js";
import { EffectTypes } from "../../context/StreamsContext";
import applyBoxBlur from "./lib/applyBoxBlur";
import applyTint from "./lib/applyTint";
import setStopFunction from "./lib/setStopFunction";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";

function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

const handleEffectCPU = async (
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
  },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  let earImageLeft: HTMLImageElement | undefined;
  let earImageRight: HTMLImageElement | undefined;

  // Create a video element to play the track
  const video = document.createElement("video");
  if (
    ((type === "webcam" || type === "screen") &&
      userUneffectedStreams.current[type][id]) ||
    (type === "audio" && userUneffectedStreams.current[type])
  ) {
    video.srcObject = new MediaStream([
      type === "webcam" || type === "screen"
        ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
        : userUneffectedStreams.current[type]!.getVideoTracks()[0],
    ]);
  } else {
    return new Error("Error getting user uneffected streams");
  }
  video.play();

  // Create a canvas to draw the video frames
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    return new Error("No canvas rendering context");
  }

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  };

  if (effects.ears) {
    earImageLeft = new Image();
    earImageLeft.src = "/assets/ears/dogEarsLeft.png";
    earImageRight = new Image();
    earImageRight.src = "/assets/ears/dogEarsRight.png";

    await loadModels();
  }

  const main = async () => {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (effects.blur) {
      applyBoxBlur(ctx, canvas);
    }
    if (effects.tint) {
      applyTint(ctx, canvas, hexToRgb(tintColor.current));
    }
    if (effects.ears && earImageLeft && earImageRight) {
      await detectFaces(video, canvas, ctx, earImageLeft, earImageRight);
    }
  };

  let isRunning = true;
  const frameRate = 60;
  const intervalId = setInterval(main, 1000 / frameRate);

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

export default handleEffectCPU;

const detectFaces = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  earImageLeft: HTMLImageElement,
  earImageRight: HTMLImageElement
) => {
  const displaySize = { width: canvas.width, height: canvas.height };

  const detections = await faceapi
    .detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.6,
      })
    )
    .withFaceLandmarks();

  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  await drawDogEars(resizedDetections, ctx, earImageLeft, earImageRight);
};

const drawDogEars = async (
  detections: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
  }>[],
  ctx: CanvasRenderingContext2D,
  earImageLeft: HTMLImageElement,
  earImageRight: HTMLImageElement
) => {
  const earWidth = 50;
  const earHeight = 50;

  // Create an array to collect all promises of drawing operations
  const drawPromises = detections.map((detection) => {
    return new Promise<void>((resolve, reject) => {
      const landmarks = detection.landmarks;
      if (!landmarks) {
        reject(new Error("No landmarks detected"));
        return;
      }

      const leftEar = landmarks.getLeftEye();
      const rightEar = landmarks.getRightEye();

      // Draw left ear
      ctx.drawImage(
        earImageLeft,
        leftEar[0].x - earWidth / 2,
        leftEar[0].y - earHeight * 2,
        earWidth,
        earHeight
      );

      // Draw right ear
      ctx.drawImage(
        earImageRight,
        rightEar[3].x - earWidth / 2,
        rightEar[3].y - earHeight * 2,
        earWidth,
        earHeight
      );

      // Resolve the promise once drawing is complete
      resolve();
    });
  });

  // Wait for all drawing operations to complete
  await Promise.all(drawPromises);
};
