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

export default applyTint;
