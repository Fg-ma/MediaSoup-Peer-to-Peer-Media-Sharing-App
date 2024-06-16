const setStopFunction = (
  animationFrameId: number[],
  video: HTMLVideoElement,
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  program: WebGLProgram,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  positionBuffer: WebGLBuffer | null,
  texCoordBuffer: WebGLBuffer | null,
  canvas: HTMLCanvasElement,
  type: "webcam" | "screen" | "audio",
  id: string,
  userStopStreamEffects: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>,
  leftDogEarImageTexture: WebGLTexture | null | undefined,
  rightDogEarImageTexture: WebGLTexture | null | undefined,
  glassesImageTexture: WebGLTexture | null | undefined
) => {
  const stopFunction = () => {
    if (animationFrameId[0]) {
      cancelAnimationFrame(animationFrameId[0]);
    }
    video.pause();
    video.srcObject = null;

    gl.deleteTexture(texture);
    if (leftDogEarImageTexture) {
      gl.deleteTexture(leftDogEarImageTexture);
    }
    if (rightDogEarImageTexture) {
      gl.deleteTexture(rightDogEarImageTexture);
    }
    if (glassesImageTexture) {
      gl.deleteTexture(glassesImageTexture);
    }
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texCoordBuffer);

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

  if (type === "webcam" || type === "screen") {
    userStopStreamEffects.current[type][id] = stopFunction;
  } else if (type === "audio") {
    userStopStreamEffects.current[type] = stopFunction;
  }
};

export default setStopFunction;
