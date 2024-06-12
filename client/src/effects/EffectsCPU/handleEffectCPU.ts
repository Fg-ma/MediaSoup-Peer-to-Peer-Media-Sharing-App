import { EffectTypes } from "src/context/StreamsContext";
import applyBoxBlur from "./lib/applyBoxBlur";
import applyTint from "./lib/applyTint";
import setStopFunction from "./lib/setStopFunction";
import * as faceapi from "face-api.js";

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
    if (effects.dogEars) {
      (async () => {
        await loadModels();
        detectFaces(video);
      })();
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

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
}

async function detectFaces(video) {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(overlay, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    drawDogEars(resizedDetections);
  }, 100);
}

function drawDogEars(detections) {
  detections.forEach((detection) => {
    const landmarks = detection.landmarks;
    const leftEar = landmarks.getLeftEye();
    const rightEar = landmarks.getRightEye();

    // Calculate dog ear positions based on eye positions
    const earImage = new Image();
    earImage.src = "dog-ears.png"; // Path to your dog ears image

    earImage.onload = () => {
      const earWidth = 50;
      const earHeight = 50;

      // Draw left ear
      ctx.drawImage(
        earImage,
        leftEar[0].x - earWidth / 2,
        leftEar[0].y - earHeight * 2,
        earWidth,
        earHeight
      );

      // Draw right ear
      ctx.drawImage(
        earImage,
        rightEar[3].x - earWidth / 2,
        rightEar[3].y - earHeight * 2,
        earWidth,
        earHeight
      );
    };
  });
}
