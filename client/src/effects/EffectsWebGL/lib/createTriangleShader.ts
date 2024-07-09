import triangleFragmentShaderSource from "./triangleFragmentShader";
import triangleVertexShaderSource from "./triangleVertexShader";

class TriangleShader {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private program: WebGLProgram | null = null;

  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  private VERTEX_SHADER = triangleVertexShaderSource;
  private FRAGMENT_SHADER = triangleFragmentShaderSource;

  // Uniform locations
  private uTriangleTextureLocation: WebGLUniformLocation | null = null;

  // Attribute locations
  private aPositionLocation: number | null = null;
  private aTexCoordLocation: number | null = null;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
    this.initShaderProgram();
    this.initUniformLocations();
    this.initAttributeLocations();
    this.initBuffers();
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
    if (this.program) {
      this.uTriangleTextureLocation = this.gl.getUniformLocation(
        this.program,
        "u_triangleTexture"
      );
    }
  }

  private initAttributeLocations() {
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
