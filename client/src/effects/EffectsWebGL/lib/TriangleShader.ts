import triangleFragmentShaderSource from "./triangleFragmentShader";
import triangleVertexShaderSource from "./triangleVertexShader";
import mustaches from "../../../../public/3DAssets/mustaches/mustacheBase.json";

class TriangleShader {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private program: WebGLProgram | null = null;

  private VERTEX_SHADER = triangleVertexShaderSource;
  private FRAGMENT_SHADER = triangleFragmentShaderSource;

  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  private triangleTexture: WebGLTexture | null = null;

  // Uniform locations
  private uTriangleTextureLocation: WebGLUniformLocation | null = null;

  // Attribute locations
  private aPositionLocation: number | null = null;
  private aTexCoordLocation: number | null = null;

  constructor(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    triangleTextureURL: string
  ) {
    this.gl = gl;
    this.initShaderProgram();
    this.initUniformLocations();
    this.initAttributeLocations();
    this.initBuffers();
    this.initTriangleTexture(triangleTextureURL);
  }

  deconstructor() {
    if (this.program) {
      const attachedShaders = this.gl.getAttachedShaders(this.program);
      if (attachedShaders) {
        for (const shader of attachedShaders) {
          this.gl.detachShader(this.program, shader);
          this.gl.deleteShader(shader);
        }
      }
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    if (this.positionBuffer) {
      this.gl.deleteBuffer(this.positionBuffer);
      this.positionBuffer = null;
    }

    if (this.texCoordBuffer) {
      this.gl.deleteBuffer(this.texCoordBuffer);
      this.texCoordBuffer = null;
    }

    // Clear uniform and attribute locations
    this.uTriangleTextureLocation = null;
    this.aPositionLocation = null;
    this.aTexCoordLocation = null;
  }

  private initShaderProgram() {
    this.use();

    const vertexShader = this.loadShader(
      this.gl.VERTEX_SHADER,
      this.VERTEX_SHADER
    );
    const fragmentShader = this.loadShader(
      this.gl.FRAGMENT_SHADER,
      this.FRAGMENT_SHADER
    );

    if (vertexShader && fragmentShader) {
      this.program = this.gl.createProgram();
      if (this.program) {
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
          console.error(
            "Unable to initialize the shader program: " +
              this.gl.getProgramInfoLog(this.program)
          );
          this.program = null;
        }
      }
    }
  }

  private loadShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (shader) {
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error(
          "An error occurred compiling the shaders: " +
            this.gl.getShaderInfoLog(shader)
        );
        this.gl.deleteShader(shader);
        return null;
      }
    }
    return shader;
  }

  private initUniformLocations() {
    this.use();

    if (this.program) {
      this.uTriangleTextureLocation = this.gl.getUniformLocation(
        this.program,
        "u_triangleTexture"
      );
    }
  }

  private initAttributeLocations() {
    this.use();

    if (this.program) {
      this.aPositionLocation = this.gl.getAttribLocation(
        this.program,
        "a_position"
      );
      this.aTexCoordLocation = this.gl.getAttribLocation(
        this.program,
        "a_texCoord"
      );
    }
  }

  private initBuffers() {
    this.use();

    if (this.aPositionLocation === null || this.aTexCoordLocation == null) {
      console.error("An error occurred while initializing the buffers");
      return;
    }

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([]),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.aPositionLocation);

    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([]),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.aTexCoordLocation);

    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([]),
      this.gl.DYNAMIC_DRAW
    );
  }

  // Method to use the shader program
  use() {
    if (this.program) {
      this.gl.useProgram(this.program);
    }
  }

  updateTrianglesBuffers(
    srcTrianglesArray: number[],
    destTrianglesArray: number[]
  ) {
    if (this.aPositionLocation === null || this.aTexCoordLocation === null) {
      return;
    }

    this.use();

    // Create or reuse buffers
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(destTrianglesArray),
      this.gl.STATIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(srcTrianglesArray),
      this.gl.STATIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    let indices = [];
    for (let i = 0; i < srcTrianglesArray.length / 2; i++) {
      indices.push(i);
    }

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.STATIC_DRAW
    );

    return indices.length;
  }

  drawMesh() {
    this.use();

    const indexCount = this.updateTrianglesBuffers(
      mustaches.uv_faces,
      mustaches.vertex_faces
    );

    if (!indexCount) {
      return;
    }

    // Draw the mesh
    this.gl.drawElements(
      this.gl.TRIANGLES,
      indexCount,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  initTriangleTexture(triangleTextureURL: string) {
    this.use();

    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );

    const image = new Image();
    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image
      );
    };
    image.src = triangleTextureURL;

    this.triangleTexture = texture;
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.uTriangleTextureLocation, 0);
  }

  // Getter methods for uniform locations (if needed)
  get triangleTextureLocation() {
    return this.uTriangleTextureLocation;
  }

  get positionLocation() {
    return this.aPositionLocation;
  }

  get texCoordLocation() {
    return this.aTexCoordLocation;
  }

  get getPositionBuffer() {
    return this.positionBuffer;
  }

  get getTexCoordBuffer() {
    return this.texCoordBuffer;
  }

  get getIndexBuffer() {
    return this.indexBuffer;
  }
}

export default TriangleShader;
