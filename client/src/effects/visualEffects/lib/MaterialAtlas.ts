import { getNextTexturePosition } from "./handleTexturePosition";

class MaterialAtlas {
  private atlasCanvas: HTMLCanvasElement | null = null;
  private atlasContext: CanvasRenderingContext2D | null = null;

  private atlasImages:
    | {
        [key: string]: {
          texs: {
            normal?: { url: string; size: number };
            transmissionRoughnessMetallic?: { url: string; size: number };
            specular?: { url: string; size: number };
            emission?: { url: string; size: number };
          };
          size?: number;
          top?: number;
          left?: number;
        };
      }
    | undefined = undefined;

  private atlasTexture: WebGLTexture | null = null;
  private uAtlasTextureLocation: WebGLUniformLocation | null = null;
  private atlasSize: number = 1024;
  private texturePosition: number | undefined = undefined;

  constructor(
    private gl: WebGL2RenderingContext | WebGLRenderingContext,
    private setMaterialAtlasSize: (size: number) => void
  ) {}

  deconstructor() {
    // Delete WebGL texture
    if (this.atlasTexture) {
      this.gl.deleteTexture(this.atlasTexture);
      this.atlasTexture = null;
    }

    // Clear the canvas and its context
    if (this.atlasCanvas) {
      this.atlasCanvas.remove();
    }
    this.atlasContext = null;
  }

  private loadImage(
    url: string
  ): Promise<{ img: HTMLImageElement; url: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve({ img, url });
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }

  private async loadImages() {
    if (this.atlasImages === undefined) {
      return;
    }

    // Step 1: Calculate the size of each entry based on its textures
    for (const key of Object.keys(this.atlasImages)) {
      this.atlasImages[key].size =
        Object.keys(this.atlasImages[key].texs).length * 256;
    }

    let currentWidth = 0; // Track horizontal position in the atlas
    let currentHeight = 0; // Track vertical position in the atlas
    const maxRowHeight = 256; // Each texture is 256 in height
    const atlasImagesEntries = Object.entries(this.atlasImages);

    // Step 2: Pack textures into the atlas
    for (const [key, value] of atlasImagesEntries) {
      const entryWidth = value.size || 0;

      // Check if the current row can accommodate the entry width
      if (currentWidth + entryWidth > this.atlasSize) {
        // Move to the next row if it doesn't fit
        currentHeight += maxRowHeight; // Move down by the height of the texture
        currentWidth = 0; // Reset width for new row
      }

      // Assign top and left positions
      value.top = currentHeight;
      value.left = currentWidth;

      // Update current width for the next entry
      currentWidth += entryWidth;
    }

    // Step 3: Calculate atlas size
    const totalHeight = currentHeight + maxRowHeight; // Height to account for last row
    const maxWidth = Math.max(currentWidth, 1024);
    const maxHeight = Math.max(totalHeight, 1024);

    const calculatePowerOfTwo = (value: number) => {
      let power = 1;
      while (power < value) {
        power *= 2;
      }
      return power;
    };

    this.atlasSize = Math.max(
      calculatePowerOfTwo(maxWidth),
      calculatePowerOfTwo(maxHeight)
    );

    // Step 4: Set canvas size
    if (!this.atlasCanvas) {
      this.atlasCanvas = document.createElement("canvas");
      this.atlasContext = this.atlasCanvas.getContext("2d");
    }
    this.atlasCanvas.width = this.atlasSize;
    this.atlasCanvas.height = this.atlasSize;

    // Step 5: Draw images onto the canvas
    for (const [key, value] of atlasImagesEntries) {
      const textures = value.texs;
      const textureOrder: Array<keyof typeof textures> = [
        "normal",
        "transmissionRoughnessMetallic",
        "specular",
        "emission",
      ];

      let position = 0;
      for (const textureType of textureOrder) {
        const texture = textures[textureType];
        if (texture && texture.url) {
          const { img } = await this.loadImage(texture.url);
          // Draw the image on the canvas at the calculated position
          this.atlasContext?.drawImage(
            img,
            value.left! + position * 256,
            value.top!,
            256,
            256
          );
          position += 1;
        }
      }
    }
  }

  async createAtlas(
    atlasImages: {
      [key: string]: {
        texs: {
          normal?: { url: string; size: number };
          transmissionRoughnessMetallic?: { url: string; size: number };
          specular?: { url: string; size: number };
          emission?: { url: string; size: number };
        };
        size?: number;
        top?: number;
        left?: number;
      };
    },
    uAtlasTextureLocation: WebGLUniformLocation | null
  ) {
    this.atlasImages = atlasImages;
    this.uAtlasTextureLocation = uAtlasTextureLocation;

    // Activate texture based on position
    const texturePosition = getNextTexturePosition();
    if (texturePosition instanceof Error) {
      return;
    }
    this.texturePosition = texturePosition;
    this.gl.activeTexture(this.gl.TEXTURE0 + this.texturePosition);

    // Set up texture
    this.atlasTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture);
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

    this.atlasCanvas = document.createElement("canvas");
    this.atlasContext = this.atlasCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!this.atlasContext) {
      throw new Error("Unable to create canvas 2D context.");
    }

    // Load images in the atlas
    await this.loadImages();

    const atlasImage = this.atlasContext.getImageData(
      0,
      0,
      this.atlasSize,
      this.atlasSize
    );

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.atlasSize,
      this.atlasSize,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      atlasImage.data
    );

    // Set uniform
    this.gl.uniform1i(this.uAtlasTextureLocation, texturePosition);

    this.setMaterialAtlasSize(this.atlasSize);
  }

  async updateAtlas(atlasImages: {
    [key: string]: {
      texs: {
        normal?: { url: string; size: number };
        transmissionRoughnessMetallic?: { url: string; size: number };
        specular?: { url: string; size: number };
        emission?: { url: string; size: number };
      };
      size?: number;
      top?: number;
      left?: number;
    };
  }) {
    if (!this.texturePosition || !this.atlasContext || !this.atlasCanvas) {
      return;
    }

    this.atlasImages = atlasImages;

    // Activate the texture
    this.gl.activeTexture(this.gl.TEXTURE0 + this.texturePosition);

    // Delete the old texture if it exists
    if (this.atlasTexture !== undefined) {
      this.gl.deleteTexture(this.atlasTexture);
      this.atlasTexture = null;
    }

    // Set up a new texture
    this.atlasTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture);
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
      this.gl.LINEAR_MIPMAP_LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );

    // Enable pre-multiplied alpha
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // Use the loadImages function to load and draw images on the canvas
    await this.loadImages();

    // Get the image data from the canvas
    const atlasImage = this.atlasContext.getImageData(
      0,
      0,
      this.atlasSize,
      this.atlasSize
    );

    // Upload the image data to the texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.atlasSize,
      this.atlasSize,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      atlasImage.data
    );

    // Generate mipmaps
    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    // Set the uniform to bind the texture to the shader
    this.gl.uniform1i(this.uAtlasTextureLocation, this.texturePosition);

    this.setMaterialAtlasSize(this.atlasSize);
  }

  getAtlasTexture() {
    return this.atlasTexture;
  }

  getTextureByMeshType(
    meshType: string // Assuming meshType is a string that matches a key in atlasImages
  ) {
    if (this.atlasImages) {
      const textureDetails = this.atlasImages[meshType]; // Access the atlas image by the meshType key
      return textureDetails || undefined; // Return the details or undefined if not found
    }
    return undefined; // Return undefined if atlasImages is not defined
  }

  getAtlasSize() {
    return this.atlasSize;
  }
}

export default MaterialAtlas;
