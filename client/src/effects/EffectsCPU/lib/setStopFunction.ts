const setStopFunction = (
  isRunning: boolean,
  intervalId: NodeJS.Timeout,
  video: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  type: "webcam" | "screen" | "audio",
  id: string,
  userStopStreamEffects: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>
) => {
  const stop = () => {
    isRunning = false;
    clearInterval(intervalId);
    video.pause();
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  if (type === "webcam" || type === "screen") {
    userStopStreamEffects.current[type][id] = stop;
  } else if (type === "audio") {
    userStopStreamEffects.current[type] = stop;
  }
};

export default setStopFunction;
