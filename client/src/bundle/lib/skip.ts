const skip = (
  duration: number,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  if (videoRef.current) {
    videoRef.current.currentTime += duration;
  }
};

export default skip;
