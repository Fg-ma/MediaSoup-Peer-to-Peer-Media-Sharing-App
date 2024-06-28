const setStopFunction = (
  animationFrameId: number[],
  video: HTMLVideoElement,
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoTexture: WebGLTexture,
  videoProgram: WebGLProgram,
  videoVertexShader: WebGLShader,
  videoFragmentShader: WebGLShader,
  videoPositionBuffer: WebGLBuffer | null,
  videoTexCoordBuffer: WebGLBuffer | null,
  triangleProgram: WebGLProgram,
  triangleVertexShader: WebGLShader,
  triangleFragmentShader: WebGLShader,
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
  leftEarImageTexture: WebGLTexture | null | undefined,
  rightEarImageTexture: WebGLTexture | null | undefined,
  glassesImageTexture: WebGLTexture | null | undefined,
  beardImageTexture: WebGLTexture | null | undefined,
  mustacheImageTexture: WebGLTexture | null | undefined
) => {
  const stopFunction = () => {
    if (animationFrameId[0]) {
      cancelAnimationFrame(animationFrameId[0]);
    }
    video.pause();
    video.srcObject = null;

    gl.deleteTexture(videoTexture);
    if (leftEarImageTexture) {
      gl.deleteTexture(leftEarImageTexture);
    }
    if (rightEarImageTexture) {
      gl.deleteTexture(rightEarImageTexture);
    }
    if (glassesImageTexture) {
      gl.deleteTexture(glassesImageTexture);
    }
    if (beardImageTexture) {
      gl.deleteTexture(beardImageTexture);
    }
    if (mustacheImageTexture) {
      gl.deleteTexture(mustacheImageTexture);
    }
    gl.deleteProgram(videoProgram);
    gl.deleteProgram(triangleProgram);
    gl.deleteShader(videoVertexShader);
    gl.deleteShader(triangleVertexShader);
    gl.deleteShader(videoFragmentShader);
    gl.deleteShader(triangleFragmentShader);
    gl.deleteBuffer(videoPositionBuffer);
    gl.deleteBuffer(videoTexCoordBuffer);

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
