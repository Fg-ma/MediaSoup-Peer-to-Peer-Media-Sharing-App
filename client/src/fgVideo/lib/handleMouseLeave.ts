const handleMouseLeave = (
  videoContainerRef: React.RefObject<HTMLDivElement>,
  leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | null>,
  controlsVanishTime: number
) => {
  if (videoContainerRef.current?.classList.contains("paused")) return;
  leaveVideoTimer.current = setTimeout(() => {
    videoContainerRef.current?.classList.remove("in-video");
  }, controlsVanishTime);
};

export default handleMouseLeave;
