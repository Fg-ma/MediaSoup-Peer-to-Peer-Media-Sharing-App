import { EffectTypes } from "../../context/StreamsContext";
import render from "./lib/render";
import createStopFunction from "./lib/createStopFunction";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateDeadbandingMaps from "./lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { releaseAllTexturePositions } from "./lib/handleTexturePosition";
import BaseShader from "./lib/BaseShader";
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

  const meshes = {
    mustache1: { meshURL: "/3DAssets/mustaches/mustache1.json" },
    mustache2: { meshURL: "/3DAssets/mustaches/mustache2.json" },
    mustache3: { meshURL: "/3DAssets/mustaches/mustache3.json" },
    mustache4: { meshURL: "/3DAssets/mustaches/mustache4.json" },
    disguiseMustache: { meshURL: "/3DAssets/mustaches/mustache1.json" },
    faceMask1: { meshURL: "/3DAssets/faceMasks/faceMask1.json" },
  };

  const baseShader = new BaseShader(gl, effects, meshes);
  if (tintColor.current) {
    baseShader.setTintColor(tintColor.current);
  }
  const faceLandmarks = new FaceLandmarks(currentEffectsStyles);
  await new Promise((resolve) => setTimeout(resolve, 100));

  const twoDimUrls = {
    [`${currentEffectsStyles.current.ears.style}Left`]: effects.ears
      ? `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
      : null,
    [`${currentEffectsStyles.current.ears.style}Right`]: effects.ears
      ? `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
      : null,
    [currentEffectsStyles.current.glasses.style]: effects.glasses
      ? `/2DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
      : null,
    [currentEffectsStyles.current.beards.style]: effects.beards
      ? `/2DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
      : null,
    [currentEffectsStyles.current.mustaches.style]: effects.mustaches
      ? `/2DAssets/mustaches/${currentEffectsStyles.current.mustaches.style}.png`
      : null,
  };

  const filteredTwoDimUrls: { [URLType in URLsTypes]?: string } =
    Object.fromEntries(
      Object.entries(twoDimUrls).filter(([key, value]) => value !== null)
    );

  const threeDimUrls = {
    // [`${currentEffectsStyles.current.ears.style}Left`]: effects.ears
    //   ? `/3DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
    //   : null,
    // [`${currentEffectsStyles.current.ears.style}Right`]: effects.ears
    //   ? `/3DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
    //   : null,
    // [currentEffectsStyles.current.glasses.style]: effects.glasses
    //   ? `/3DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
    //   : null,
    // [currentEffectsStyles.current.beards.style]: effects.beards
    //   ? `/3DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
    //   : null,
    [currentEffectsStyles.current.mustaches.style]:
      effects.mustaches && currentEffectsStyles.current.mustaches.threeDim
        ? `/3DAssets/mustaches/${currentEffectsStyles.current.mustaches.style}.png`
        : null,
    [currentEffectsStyles.current.faceMask.style]:
      effects.faceMask && currentEffectsStyles.current.faceMask.threeDim
        ? `/3DAssets/faceMasks/${currentEffectsStyles.current.faceMask.style}.png`
        : null,
  };

  const filteredThreeDimUrls: { [URLType in URLsTypes]?: string } =
    Object.fromEntries(
      Object.entries(threeDimUrls).filter(([key, value]) => value !== null)
    );

  await baseShader.createAtlasTexture("twoDim", filteredTwoDimUrls);
  await baseShader.createAtlasTexture("threeDim", filteredThreeDimUrls);

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
      faceLandmarks,
      video,
      canvas,
      animationFrameId,
      effects,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults
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
    canvas,
    type,
    id,
    userStopStreamEffects
  );

  return canvas.captureStream().getVideoTracks()[0];
};

export default handleEffectWebGL;
