import BaseShader from "./BaseShader";

const createStopFunction = (
  animationFrameId: number[],
  video: HTMLVideoElement,
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader,
  canvas: HTMLCanvasElement,
  type: "camera" | "screen" | "audio",
  id: string,
  userStopStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>
) => {
  const stopFunction = () => {
    if (animationFrameId[0]) {
      cancelAnimationFrame(animationFrameId[0]);
    }
    video.pause();
    video.srcObject = null;

    baseShader.deconstructor();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (canvas) {
      const contextAttributes = gl.getContextAttributes();
      if (contextAttributes && contextAttributes.preserveDrawingBuffer) {
        gl.clear(gl.COLOR_BUFFER_BIT);
      }

      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
      }
    }

    canvas.remove();
  };

  if (type === "camera" || type === "screen") {
    userStopStreamEffects.current[type][id] = stopFunction;
  } else if (type === "audio") {
    userStopStreamEffects.current[type] = stopFunction;
  }
};

export default createStopFunction;
