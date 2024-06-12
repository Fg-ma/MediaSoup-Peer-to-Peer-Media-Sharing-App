const applyBoxBlur = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Adjust blur radius for stronger blur effect
  const blurRadius = 6; // Increased blur radius

  // Apply box blur effect to the image data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let dy = -blurRadius; dy <= blurRadius; dy++) {
        for (let dx = -blurRadius; dx <= blurRadius; dx++) {
          const xOffset = Math.min(Math.max(x + dx, 0), width - 1);
          const yOffset = Math.min(Math.max(y + dy, 0), height - 1);
          const pixelIndex = (yOffset * width + xOffset) * 4;
          r += data[pixelIndex];
          g += data[pixelIndex + 1];
          b += data[pixelIndex + 2];
          count++;
        }
      }
      const pixelIndex = (y * width + x) * 4;
      data[pixelIndex] = r / count;
      data[pixelIndex + 1] = g / count;
      data[pixelIndex + 2] = b / count;
    }
  }

  const glazeStrength = 0.15; // Strength of the glaze effect (adjust as needed)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * (1 - glazeStrength); // Red
    data[i + 1] = data[i + 1] * (1 - glazeStrength); // Green
    data[i + 2] = data[i + 2] * (1 - glazeStrength); // Blue
  }

  ctx.putImageData(imageData, 0, 0);
};

const applyTint = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  tintColorVector: number[]
) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  const tintStrength = 0.3;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] + tintStrength * (tintColorVector[0] - data[i]);
    data[i + 1] =
      data[i + 1] + tintStrength * (tintColorVector[1] - data[i + 1]);
    data[i + 2] =
      data[i + 2] + tintStrength * (tintColorVector[2] - data[i + 2]);
  }

  ctx.putImageData(imageData, 0, 0);
};

export { applyBoxBlur, applyTint };
