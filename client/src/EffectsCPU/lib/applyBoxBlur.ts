const applyBoxBlur = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  const blurRadius = 6;

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

  const glazeStrength = 0.15;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * (1 - glazeStrength);
    data[i + 1] = data[i + 1] * (1 - glazeStrength);
    data[i + 2] = data[i + 2] * (1 - glazeStrength);
  }

  ctx.putImageData(imageData, 0, 0);
};

export default applyBoxBlur;
