import { EffectTypes } from "src/context/StreamsContext";
import updateBaseVideoTexture from "./updateBaseVideoTexture";
// import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import drawFaceMesh from "./drawFaceMesh";
import applyFaceTracker from "./applyFaceTracker";
import landmarksSmoothWithDeadbanding from "./landmarksSmoothWithDeadbanding";
import drawMustacheMesh from "./drawMustacheMesh";
import { BaseShader, BaseShader2 } from "./createBaseShader";
import TriangleShader from "./createTriangleShader";
import FaceLandmarks from "./FaceLandmarks";

const render = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader2,
  triangleShader: TriangleShader,
  faceLandmarks: FaceLandmarks,
  baseVideoTexture: WebGLTexture,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  // faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
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

    faceLandmarks.update(multiFaceLandmarks);

    // await updateFaceLandmarks(
    //   smoothedFaceIdLandmarksPairs,
    //   gl,
    //   baseShader,
    //   canvas,
    //   effects,
    //   faceLandmarks,
    //   currentEffectsStyles
    // );

    if (
      faceLandmarks.getFaceIdLandmarksPairs()[0] &&
      faceLandmarks.getRightEarWidths()[0]
    ) {
      baseShader.drawEffect(
        urls[1],
        {
          x:
            2 * faceLandmarks.getFaceIdLandmarksPairs()[0].landmarks[473].x - 1,
          y:
            -2 * faceLandmarks.getFaceIdLandmarksPairs()[0].landmarks[473].y +
            1,
        },
        faceLandmarks.getRightEarWidths()[0]
      );
    }

    if (effects.faceMask && triangleTexture) {
      faceLandmarks
        .getFaceIdLandmarksPairs()
        .forEach((smoothedFaceIdLandmarksPair) => {
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
    )
  );
};

export default render;
