import { EffectTypes } from "../../context/StreamsContext";
import initializeBaseUniforms from "./lib/initializeBaseUniforms";
import createAndSetupTexture from "./lib/createAndSetupTexture";
import render from "./lib/render";
import createStopFunction from "./lib/createStopFunction";
import { loadTexture } from "./lib/loadTexture";
import loadModels from "../lib/loadModels";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateDeadbandingMaps from "./lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import initializeTriangleUniforms from "./lib/initializeTriangleUniforms";
import { releaseAllTexturePositions } from "./lib/handleTexturePosition";
import {
  updateCurrentPositionsOffsetsTexturePosition,
  updateCurrentWidthsHeadRotationAnglesTexturePosition,
} from "./lib/updateBaseUniforms";
import { BaseShader, BaseShader2 } from "./lib/createBaseShader";
import TriangleShader from "./lib/createTriangleShader";
import FaceLandmarks from "./lib/FaceLandmarks";

// export type FaceLandmarks =
//   | "headRotationAngles"
//   | "leftEarWidths"
//   | "rightEarWidths"
//   | "leftEyePositions"
//   | "rightEyePositions"
//   | "eyesCenterPositions"
//   | "eyesWidths"
//   | "chinPositions"
//   | "chinWidths"
//   | "nosePositions";

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
  updateCurrentPositionsOffsetsTexturePosition(undefined);
  updateCurrentWidthsHeadRotationAnglesTexturePosition(undefined);

  // Setup WebGL context
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    return new Error("WebGL not supported");
  }

  const baseShader = new BaseShader2(gl);
  const triangleShader = new TriangleShader(gl);
  const faceLandmarks = new FaceLandmarks(currentEffectsStyles);

  // Create base video texture
  const baseVideoTexture = createAndSetupTexture(gl);

  if (!baseVideoTexture) {
    return new Error("No baseVideoTexture");
  }

  if (
    effects.ears ||
    effects.glasses ||
    effects.beards ||
    effects.mustaches ||
    effects.faceMask
  ) {
    await loadModels();
  }

  // Load ear images as textures
  let leftEarImageTexture: WebGLTexture | null | undefined;
  let leftEarImageAspectRatio: number | undefined;
  let rightEarImageTexture: WebGLTexture | null | undefined;
  let rightEarImageAspectRatio: number | undefined;
  if (effects.ears) {
    const leftEarTexture = await loadTexture(
      gl,
      `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
    );
    leftEarImageTexture = leftEarTexture.texture;
    leftEarImageAspectRatio = leftEarTexture.aspectRatio;
    const rightEarTexture = await loadTexture(
      gl,
      `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
    );
    rightEarImageTexture = rightEarTexture.texture;
    rightEarImageAspectRatio = rightEarTexture.aspectRatio;

    if (
      !leftEarImageTexture ||
      !leftEarImageAspectRatio ||
      !rightEarImageTexture ||
      !rightEarImageAspectRatio
    ) {
      return new Error(
        "No leftEarImageTexture or leftEarImageAspectRatio or rightEarImageTexture or rightEarImageAspectRatio"
      );
    }
  }

  // Load glasses image as textures
  let glassesImageTexture: WebGLTexture | null | undefined;
  let glassesImageAspectRatio: number | undefined;
  if (effects.glasses) {
    const glassesTexture = await loadTexture(
      gl,
      `/2DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
    );
    glassesImageTexture = glassesTexture.texture;
    glassesImageAspectRatio = glassesTexture.aspectRatio;

    if (!glassesImageTexture || !glassesImageAspectRatio) {
      return new Error("No glassesImage or glassesImageAspectRatio");
    }
  }

  // Load beard image as textures
  let beardImageTexture: WebGLTexture | null | undefined;
  let beardImageAspectRatio: number | undefined;
  if (effects.beards) {
    const beardTexture = await loadTexture(
      gl,
      `/2DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
    );
    beardImageTexture = beardTexture.texture;
    beardImageAspectRatio = beardTexture.aspectRatio;

    if (!beardImageTexture || !beardImageAspectRatio) {
      return new Error("No beardImageTexture or beardImageAspectRatio");
    }
  }

  // Load mustaches image as textures
  let mustacheImageTexture: WebGLTexture | null | undefined;
  let mustacheImageAspectRatio: number | undefined;
  if (effects.mustaches) {
    const mustacheTexture = await loadTexture(
      gl,
      `/2DAssets/mustaches/${currentEffectsStyles.current.mustaches.style}.png`
    );
    mustacheImageTexture = mustacheTexture.texture;
    mustacheImageAspectRatio = mustacheTexture.aspectRatio;

    if (!mustacheImageTexture || !mustacheImageAspectRatio) {
      return new Error("No mustacheImageTexture or mustacheImageAspectRatio");
    }
  }

  // Load triangle image as textures
  let triangleTexture: WebGLTexture | null | undefined;
  if (effects.faceMask) {
    const loadedTriangleTexture = await loadTexture(
      gl,
      `/2DAssets/mustacheTexture.png`
      // `/2DAssets/james2.png`
    );
    triangleTexture = loadedTriangleTexture.texture;

    if (!triangleTexture) {
      return new Error("No triangleTexture or triangleAspectRatio");
    }
  }

  const urls = [
    effects.ears || true
      ? `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
      : null,
    effects.ears || true
      ? `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
      : null,
    effects.glasses || true
      ? `/2DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
      : null,
    effects.beards || true
      ? `/2DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
      : null,
    effects.mustaches || true
      ? `/2DAssets/mustaches/${currentEffectsStyles.current.mustaches.style}.png`
      : null,
  ].filter((url) => url !== null);

  // Set up the uniforms in the base fragment shader
  // await initializeBaseUniforms(
  //   gl,
  //   baseShader,
  //   canvas,
  //   effects,
  //   tintColor,
  //   leftEarImageAspectRatio,
  //   rightEarImageAspectRatio,
  //   glassesImageAspectRatio,
  //   beardImageAspectRatio,
  //   mustacheImageAspectRatio,
  //   urls
  // );

  // Set up the uniforms in the triangle fragment shader
  // initializeTriangleUniforms(gl, triangleShader, effects, triangleTexture);

  // const faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean } = {
  //   headRotationAngles: false,
  //   leftEarWidths: false,
  //   rightEarWidths: false,
  //   leftEyePositions: false,
  //   rightEyePositions: false,
  //   eyesCenterPositions: false,
  //   eyesWidths: false,
  //   chinPositions: false,
  //   chinWidths: false,
  //   nosePositions: false,
  // };

  // if (effects.ears) {
  //   faceLandmarks.headRotationAngles = true;
  //   faceLandmarks.leftEyePositions = true;
  //   faceLandmarks.rightEyePositions = true;
  //   faceLandmarks.leftEarWidths = true;
  //   faceLandmarks.rightEarWidths = true;
  // }
  // if (effects.glasses) {
  //   faceLandmarks.headRotationAngles = true;
  //   faceLandmarks.eyesCenterPositions = true;
  //   faceLandmarks.eyesWidths = true;
  // }
  // if (effects.beards) {
  //   faceLandmarks.headRotationAngles = true;
  //   faceLandmarks.chinPositions = true;
  //   faceLandmarks.chinWidths = true;
  // }
  // if (effects.mustaches) {
  //   faceLandmarks.headRotationAngles = true;
  //   faceLandmarks.nosePositions = true;
  //   faceLandmarks.eyesWidths = true;
  // }

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

  baseShader.createAtlasTexture(urls);

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
      baseVideoTexture,
      video,
      canvas,
      animationFrameId,
      effects,
      // faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      triangleTexture,
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
    baseVideoTexture,
    baseShader,
    triangleShader,
    canvas,
    type,
    id,
    userStopStreamEffects,
    leftEarImageTexture,
    rightEarImageTexture,
    glassesImageTexture,
    beardImageTexture,
    mustacheImageTexture
  );

  return canvas.captureStream().getVideoTracks()[0];
};

export default handleEffectWebGL;
