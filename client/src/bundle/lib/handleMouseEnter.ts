const handleMouseEnter = (
  videoContainerRef: React.RefObject<HTMLDivElement>,
  leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  videoContainerRef.current?.classList.add("in-video");
  if (leaveVideoTimer.current) {
    clearTimeout(leaveVideoTimer.current);
    leaveVideoTimer.current = null;
  }
};

export default handleMouseEnter;
