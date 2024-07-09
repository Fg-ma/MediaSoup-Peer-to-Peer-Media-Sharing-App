import { EffectTypes } from "src/context/StreamsContext";
import updateBaseVideoTexture from "./updateBaseVideoTexture";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import drawFaceMesh from "./drawFaceMesh";
import applyFaceTracker from "./applyFaceTracker";
import landmarksSmoothWithDeadbanding from "./landmarksSmoothWithDeadbanding";
import drawMustacheMesh from "./drawMustacheMesh";
import { BaseShader, BaseShader2 } from "./createBaseShader";
import TriangleShader from "./createTriangleShader";

const render = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader2,
  triangleShader: TriangleShader,
  baseVideoTexture: WebGLTexture,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[],
  triangleTexture: WebGLTexture | null | undefined,
  urls: string[]
) => {
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // updateBaseVideoTexture(gl, baseVideoTexture, video, baseShader);

  baseShader.updateVideoTexture(video);
  baseShader.drawEffect(urls[1], { x: 0, y: 0 }, 1);

  if (
    effects.ears ||
    effects.glasses ||
    effects.beards ||
    effects.mustaches ||
    effects.faceMask
  ) {
    await faceMesh.send({ image: video });
    if (!faceMeshResults[0]) {
      return;
    }
    const multiFaceLandmarks = faceMeshResults[0].multiFaceLandmarks;
    if (!multiFaceLandmarks) {
      return;
    }

    const faceIdLandmarksPairs = applyFaceTracker(multiFaceLandmarks);

    const smoothedFaceIdLandmarksPairs =
      landmarksSmoothWithDeadbanding(faceIdLandmarksPairs);

    // await updateFaceLandmarks(
    //   smoothedFaceIdLandmarksPairs,
    //   gl,
    //   baseShader,
    //   canvas,
    //   effects,
    //   faceLandmarks,
    //   currentEffectsStyles
    // );

    if (effects.faceMask && triangleTexture) {
      smoothedFaceIdLandmarksPairs.forEach((smoothedFaceIdLandmarksPair) => {
        // drawFaceMesh(
        //   gl,
        //   smoothedFaceIdLandmarksPair.landmarks.slice(0, -10),
        //   triangleShader
        // );
        drawMustacheMesh(gl, triangleShader);
      });
    }
  }

  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      gl,
      baseShader,
      triangleShader,
      baseVideoTexture,
      video,
      canvas,
      animationFrameId,
      effects,
      faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      triangleTexture,
      urls
    )
  );
};

export default render;
