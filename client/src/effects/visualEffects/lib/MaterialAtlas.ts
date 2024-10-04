import { getNextTexturePosition } from "./handleTexturePosition";

class MaterialAtlas {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private atlasCanvas: HTMLCanvasElement | null = null;
  private atlasContext: CanvasRenderingContext2D | null = null;

  private atlasImages:
    | {
        [key: string]: {
          normal?: { url: string; size: number };
          transmissionRoughnessMetallic?: { url: string; size: number };
          specular?: { url: string; size: number };
          emission?: { url: string; size: number };
        };
      }
    | undefined = undefined;
  private altasImageURLMap: {
    url: string;
    top: number;
    left: number;
    size: number;
  }[] = [];

  private atlasTexture: WebGLTexture | null = null;
  private uAtlasTextureLocation: WebGLUniformLocation | null = null;
  private atlasSize: number | null = null;
  private texturePosition: number | undefined = undefined;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
  }

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
    if (this.atlasImages === undefined || this.atlasSize === null) {
      return;
    }

    const textureSize = 256; // All textures are 256x256
    let currentWidth = 0; // To track the horizontal position in the atlas

    // Iterate through each key in the atlasImages
    for (const [key, textures] of Object.entries(this.atlasImages)) {
      let currentHeight = 0; // Reset height for each new column (key)

      // Define the order in which the textures will be drawn
      const textureOrder = [
        "normal",
        "transmissionRoughnessMetallic",
        "specular",
        "emission",
      ];

      // Loop through each texture type (normal, transmissionRoughnessMetallic, etc.)
      for (const textureType of textureOrder) {
        const texture = textures[textureType as keyof typeof textures];

        if (texture && texture.url) {
          const { url, size } = texture;

          // Load the image
          const image = await this.loadImage(url);
          const img = image.img;

          // Ensure the current width + the image width doesn't exceed the atlas size
          if (currentWidth + textureSize > this.atlasSize) {
            // Move to the next row (horizontally)
            currentWidth += textureSize;
            currentHeight = 0; // Reset height for the new column
          }

          // Draw the image on the canvas at the current position (stacked vertically)
          this.atlasContext?.drawImage(
            img,
            currentWidth,
            currentHeight,
            textureSize,
            textureSize
          );

          // Store the image position in the map
          if (textureType === "normal") {
            this.altasImageURLMap.push({
              url: url,
              top: currentHeight,
              left: currentWidth,
              size: textureSize,
            });
          }
        }

        // Move the height down by 256 pixels, even if the texture wasn't defined
        currentHeight += textureSize;
      }

      // After processing all textures for the current key, move to the next column
      currentWidth += textureSize;
    }
  }

  async createAtlas(
    atlasImages: {
      [key: string]: {
        normal?: { url: string; size: number };
        transmissionRoughnessMetallic?: { url: string; size: number };
        specular?: { url: string; size: number };
        emission?: { url: string; size: number };
      };
    },
    uAtlasTextureLocation: WebGLUniformLocation | null
  ) {
    this.atlasImages = atlasImages;
    this.uAtlasTextureLocation = uAtlasTextureLocation;

    this.altasImageURLMap = [];

    // Activate texture based on position
    const texturePosition = getNextTexturePosition();
    if (texturePosition instanceof Error) {
      console.error(texturePosition);
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

    // Calculate the required atlas size based on total image size
    let totalWidth = 1024; // Start with a base size
    let totalHeight = 1024; // Start with a base size
    if (Object.keys(this.atlasImages).length > 0) {
      totalWidth = Math.max(
        ...Object.values(this.atlasImages).map((textures) =>
          Math.max(
            textures.normal?.size || 0,
            textures.transmissionRoughnessMetallic?.size || 0,
            textures.specular?.size || 0,
            textures.emission?.size || 0
          )
        )
      );
      totalHeight = Object.keys(this.atlasImages).length * totalWidth;
    }

    // Ensure the atlas size is the next multiple of 1024
    const nextMultipleOf1024 = (size: number) => Math.ceil(size / 1024) * 1024;

    this.atlasSize = Math.max(
      nextMultipleOf1024(totalWidth),
      nextMultipleOf1024(totalHeight)
    );

    this.atlasCanvas = document.createElement("canvas");
    this.atlasCanvas.width = this.atlasSize;
    this.atlasCanvas.height = this.atlasSize;
    this.atlasContext = this.atlasCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    document.getElementById("root")?.appendChild(this.atlasCanvas);

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
  }

  async updateAtlas(atlasImages: {
    [URLType in string]: {
      [key: string]: {
        normal?: { url: string; size: number };
        transmissionRoughnessMetallic?: { url: string; size: number };
        specular?: { url: string; size: number };
        emission?: { url: string; size: number };
      };
    };
  }) {
    if (!this.texturePosition || !this.atlasContext || !this.atlasCanvas) {
      return;
    }

    this.atlasImages = atlasImages;
    const textureCount = Object.keys(this.atlasImages).length;

    if (textureCount === 0) {
      return;
    }

    this.altasImageURLMap = [];

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

    // Recalculate atlas size and canvas dimensions
    let currentHeight = 0;
    let currentWidth = 0;
    let maxHeight = 0; // Keep track of the tallest image in the current row

    // Helper function to ensure the size is a multiple of 1024
    const nextMultipleOf1024 = (size: number) => Math.ceil(size / 1024) * 1024;

    // Calculate the size of the atlas and placement of images
    for (const textures of Object.values(this.atlasImages)) {
      const maxTextureSize = Math.max(
        textures.normal?.size || 0,
        textures.transmissionRoughnessMetallic?.size || 0,
        textures.specular?.size || 0,
        textures.emission?.size || 0
      );

      if (maxTextureSize > 0) {
        currentWidth += maxTextureSize;
        maxHeight = Math.max(maxHeight, maxTextureSize);

        // If the current width exceeds the atlas size, move to the next row
        if (currentWidth > (this.atlasSize ?? 0)) {
          currentHeight += maxHeight; // Move down by the tallest image
          currentWidth = maxTextureSize; // Start new row with the current image
          maxHeight = maxTextureSize; // Reset maxHeight for the new row
        }
      }
    }

    // Update the atlasSize to the next multiple of 1024
    this.atlasSize = Math.max(
      nextMultipleOf1024(currentWidth),
      nextMultipleOf1024(currentHeight + maxHeight)
    );

    // Set the new canvas dimensions
    this.atlasCanvas.width = this.atlasSize;
    this.atlasCanvas.height = this.atlasSize;

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
  }

  getAtlasTexture() {
    return this.atlasTexture;
  }

  getTextureByURL(url: string) {
    return this.altasImageURLMap.find((entry) => entry.url === url);
  }

  getAtlasSize() {
    return this.atlasSize;
  }
}

export default MaterialAtlas;
