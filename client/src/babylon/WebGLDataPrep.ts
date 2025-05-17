class WebGLDataPrep {
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private aPosLoc: number;
  private uTexLoc: WebGLUniformLocation;
  private quadVBO: WebGLBuffer;
  private tex: WebGLTexture;

  constructor(private glCanvas: OffscreenCanvas) {
    this.gl = this.glCanvas.getContext("webgl", {
      preserveDrawingBuffer: true,
    })!;
    // predictable clear
    this.gl.clearColor(0, 0, 0, 0);
    // flip Y for correct orientation
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);

    // Compile shaders
    const vs = this.compileShader(
      `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0, 1);
      }
    `,
      this.gl.VERTEX_SHADER,
    );

    const fs = this.compileShader(
      `
      precision mediump float;
      uniform sampler2D u_tex;
      varying vec2 v_uv;
      void main() {
        gl_FragColor = texture2D(u_tex, v_uv);
      }
    `,
      this.gl.FRAGMENT_SHADER,
    );

    // Link program
    this.prog = this.gl.createProgram()!;
    this.gl.attachShader(this.prog, vs);
    this.gl.attachShader(this.prog, fs);
    this.gl.linkProgram(this.prog);
    if (!this.gl.getProgramParameter(this.prog, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramInfoLog(this.prog)!);
    }
    this.aPosLoc = this.gl.getAttribLocation(this.prog, "a_pos");
    this.uTexLoc = this.gl.getUniformLocation(this.prog, "u_tex")!;

    // Fullscreen quad
    this.quadVBO = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      this.gl.STATIC_DRAW,
    );

    // Texture setup
    this.tex = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR,
    );
  }

  private compileShader(src: string, type: number) {
    const s = this.gl.createShader(type)!;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(s)!);
    }
    return s;
  }

  async downsampleToBitmap(input: TexImageSource): Promise<ImageBitmap> {
    // If passing video/image, snapshot to ImageBitmap first
    let source: TexImageSource = input;
    if (
      input instanceof HTMLVideoElement ||
      input instanceof HTMLImageElement
    ) {
      source = await createImageBitmap(input);
    }

    const { gl, glCanvas, tex, prog, aPosLoc, uTexLoc, quadVBO } = this;
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Upload
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    // Draw
    gl.useProgram(prog);
    gl.uniform1i(uTexLoc, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Return the 320×320 downsampled bitmap
    return glCanvas.transferToImageBitmap();
  }
}

export default WebGLDataPrep;
