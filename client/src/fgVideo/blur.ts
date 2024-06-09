const handleBlur = async (
  track: MediaStreamTrack
): Promise<{ blurredTrack: MediaStreamTrack; stop: () => void }> => {
  // Create a video element to play the track
  const video = document.createElement("video");
  video.srcObject = new MediaStream([track]);
  video.play();

  // Create a canvas to draw the video frames
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    return { blurredTrack: track, stop: () => {} };
  }

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth / 4;
    canvas.height = video.videoHeight / 4;
  };

  let isRunning = true;
  const frameRate = 60;
  const intervalId = setInterval(() => {
    if (!isRunning) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyBoxBlur(ctx, canvas);
  }, 1000 / frameRate);

  // Function to stop the blurring process
  const stop = () => {
    isRunning = false;
    clearInterval(intervalId);
    video.pause();
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return {
    blurredTrack: canvas.captureStream().getVideoTracks()[0],
    stop,
  };
};

const applyGaussianBlur = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Adjust blur radius and sigma for stronger blur effect
  const blurRadius = 30; // Increased blur radius
  const sigma = 3; // Increased standard deviation for Gaussian blur

  const weights = [];
  let sum = 0;

  // Generate Gaussian kernel weights with added noise
  for (let i = -blurRadius; i <= blurRadius; i++) {
    const weight =
      Math.exp((-i * i) / (2 * sigma * sigma)) * (Math.random() * 0.5 + 0.5); // Adding noise
    weights.push(weight);
    sum += weight;
  }

  // Normalize weights
  for (let i = 0; i < weights.length; i++) {
    weights[i] /= sum;
  }

  // Apply blur effect to the image data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;
      for (let i = -blurRadius; i <= blurRadius; i++) {
        const xOffset = Math.min(Math.max(x + i, 0), width - 1);
        const pixelIndex = (y * width + xOffset) * 4;
        r += data[pixelIndex] * weights[i + blurRadius];
        g += data[pixelIndex + 1] * weights[i + blurRadius];
        b += data[pixelIndex + 2] * weights[i + blurRadius];
      }
      const pixelIndex = (y * width + x) * 4;
      data[pixelIndex] = r;
      data[pixelIndex + 1] = g;
      data[pixelIndex + 2] = b;
    }
  }

  const glazeStrength = 0.1; // Strength of the glaze effect (adjust as needed)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * (1 - glazeStrength); // Red
    data[i + 1] = data[i + 1] * (1 - glazeStrength); // Green
    data[i + 2] = data[i + 2] * (1 - glazeStrength); // Blue
  }

  ctx.putImageData(imageData, 0, 0);
};

const applyBoxBlur = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Adjust blur radius for stronger blur effect
  const blurRadius = 8; // Increased blur radius

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

export default handleBlur;
