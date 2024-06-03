const handlePausePlay = (
  paused: React.MutableRefObject<boolean>,
  videoRef: React.RefObject<HTMLVideoElement>,
  videoContainerRef: React.RefObject<HTMLDivElement>
) => {
  paused.current = !paused.current;
  if (paused.current) {
    videoRef.current?.pause();
    videoContainerRef.current?.classList.add("paused");
  } else {
    videoRef.current?.play();
    videoContainerRef.current?.classList.remove("paused");
  }
};

export default handlePausePlay;
