import updateTexture from "./updateTexture";

const render = (
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement,
  animationFrameId: number[]
) => {
  updateTexture(gl, texture, video);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  animationFrameId[0] = requestAnimationFrame(() =>
    render(gl, texture, video, animationFrameId)
  );
};

export default render;
