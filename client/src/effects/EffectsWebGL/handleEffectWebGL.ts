import { EffectTypes } from "../../context/StreamsContext";
import render from "./lib/render";
import createStopFunction from "./lib/createStopFunction";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateDeadbandingMaps from "./lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { releaseAllTexturePositions } from "./lib/handleTexturePosition";
import BaseShader from "./lib/BaseShader";
import TriangleShader from "./lib/TriangleShader";
import FaceLandmarks from "./lib/FaceLandmarks";

export type URLsTypes =
  | "leftEar"
  | "rightEar"
  | "glasses"
  | "beards"
  | "mustaches";

const handleEffectWebGL = async (
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
  releaseAllTexturePositions();

  // Setup WebGL context
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    return new Error("WebGL not supported");
  }

  const baseShader = new BaseShader(gl, effects);
  if (tintColor.current) {
    baseShader.setTintColor(tintColor.current);
  }
  const triangleShader = new TriangleShader(
    gl,
    `/3DAssets/mustaches/mustacheTexture.png`
  );
  const faceLandmarks = new FaceLandmarks(currentEffectsStyles);
  await new Promise((resolve) => setTimeout(resolve, 100));

  const urls = {
    leftEar: effects.ears
      ? `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
      : null,
    rightEar: effects.ears
      ? `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
      : null,
    glasses: effects.glasses
      ? `/2DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
      : null,
    beards: effects.beards
      ? `/2DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
      : null,
    mustaches: effects.mustaches
      ? `/2DAssets/mustaches/${currentEffectsStyles.current.mustaches.style}.png`
      : null,
  };

  const filteredUrls: { [URLType in URLsTypes]?: string } = Object.fromEntries(
    Object.entries(urls).filter(([key, value]) => value !== null)
  );

  await baseShader.createAtlasTexture("twoDim", filteredUrls);
  await baseShader.createAtlasTexture("threeDim", {
    mustaches: `/3DAssets/mustaches/colorMustacheTex.png`,
  });

  updateDeadbandingMaps(effects, currentEffectsStyles);

  let faceMeshResults: Results[] = [];
  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    },
  });
  faceMesh.setOptions({
    maxNumFaces: 2,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  faceMesh.onResults((results) => {
    faceMeshResults[0] = results;
  });

  // Start video and render loop
  let animationFrameId: number[] = [];
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
  video.addEventListener("play", () => {
    render(
      gl,
      baseShader,
      triangleShader,
      faceLandmarks,
      video,
      canvas,
      animationFrameId,
      effects,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      urls
    );
  });
  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    video.play();
  };

  // Set up stop function
  createStopFunction(
    animationFrameId,
    video,
    gl,
    baseShader,
    triangleShader,
    canvas,
    type,
    id,
    userStopStreamEffects
  );

  return canvas.captureStream().getVideoTracks()[0];
};

export default handleEffectWebGL;
