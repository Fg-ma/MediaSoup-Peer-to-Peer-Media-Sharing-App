import formatDuration from "./formatDuration";

const timeUpdate = (
  videoRef: React.RefObject<HTMLVideoElement>,
  currentTimeRef: React.RefObject<HTMLDivElement>,
  timelineContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (!videoRef.current) return;

  if (currentTimeRef.current) {
    currentTimeRef.current.textContent = formatDuration(
      videoRef.current.currentTime
    );
  }
  const percent = videoRef.current.currentTime / videoRef.current.duration;
  if (timelineContainerRef.current) {
    timelineContainerRef.current.style.setProperty(
      "--progress-position",
      `${percent}`
    );
  }
};

export default timeUpdate;
